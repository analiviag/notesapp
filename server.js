import dotenv from 'dotenv';
dotenv.config(); // Ideally, only in index.js, but keeping it because it solves the SESSION_SECRET issue I had before.

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import helmet from 'helmet';
import { initializePassport } from './src/config/passportConfig.js';
import { router as apiRouter } from './router.js';
import webRouter from './webRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initializePassport(passport);
export const app = express();

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Security Middleware
app.set('trust proxy', 1); //Adding this because I plan to deploy in future

app.use(
  //Had to update this because had an issue with the css file
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", 'https://cdn.jsdelivr.net'],
        'style-src': [
          "'self'",
          'https://bootswatch.com',
          'https://fonts.googleapis.com',
          "'unsafe-inline'",
        ],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https.getbootstrap.com'],
      },
    },
  })
);

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Core Middleware
app.use(cors()); // For API cross-origin requests if needed
app.use(morgan('dev'));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// Method Override (for HTML forms to use PUT/DELETE)
app.use(methodOverride('_method'));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.DB_CONN,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// Passport Authentication Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Messages Middleware
app.use(flash());

// Middleware to make data available to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

// --- ROUTERS ---
// API Routes
app.use('/api', apiRouter);
app.use('/', webRouter);

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('--GLOBAL ERROR HANDLER CAUGHT--');
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected internal server error occurred.';
  let isApiRoute = req.originalUrl.startsWith('/api');

  if (isApiRoute) {
    let errorDetails = {};
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation Failed. Please check input data.';
      errorDetails.validationErrors = {};
      for (let field in err.errors) {
        errorDetails.validationErrors[field] = err.errors[field].message;
      }
    } else if (err.name === 'CastError' && err.kind === 'ObjectId') {
      statusCode = 400;
      message = 'Invalid ID format provided.';
    } else if (
      err.name === 'UserExistsError' ||
      err.code === 11000 ||
      err.code === 409
    ) {
      statusCode = 409;
    }

    return res.status(statusCode).json({
      status: statusCode >= 500 ? 'error' : 'fail',
      message: message,
      ...(Object.keys(errorDetails).length > 0 && { errors: errorDetails }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // For Web (EJS) routes, render an error page - left developer mode for now
  res.status(statusCode).render('error', {
    error: {
      message: message,
      status: statusCode,
      stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    },
    pageTitle: `Error ${statusCode}`,
  });
});
