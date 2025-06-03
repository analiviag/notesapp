import express from 'express';
import { ensureAuthenticatedForWeb } from './src/middleware/ensureAuthenticatedForWeb.js';
import notesHandler from './src/handlers/note.js';
import catchAsync from './src/utils/catchAsync.js';
import { body, validationResult, param } from 'express-validator';

const webRouter = express.Router();

//Home
webRouter.get('/', (req, res) => {
  res.render('home', { pageTitle: 'Welcome' });
});

//Login
webRouter.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    req.flash('success', 'You are already logged in!');
    return res.redirect('/notes');
  }
  res.render('login', { pageTitle: 'Login' });
});

//Register
webRouter.get('/register', (req, res) => {
  if (req.isAuthenticated()) {
    req.flash('success', 'You are already logged in!');
    return res.redirect('/notes');
  }
  res.render('register', { pageTitle: 'Register' });
});

//Notes
webRouter.get(
  '/notes',
  ensureAuthenticatedForWeb,
  catchAsync(async (req, res) => {
    if (!req.user || !req.user._id) {
      req.flash('error', 'User not found. Please log in again.');
      return res.redirect('/login');
    }
    const userId = req.user._id;
    const userNotes = await notesHandler.getNotesByUserId(userId);

    res.render('notes/index', {
      pageTitle: 'My Notes',
      notes: userNotes,
    });
  })
);

//Display form to create new note
webRouter.get('/notes/new', ensureAuthenticatedForWeb, (req, res) => {
  res.render('notes/new', {
    pageTitle: 'Create New Note',
    formData: {},
    errors: [],
  });
});

//POST request to create a new note
webRouter.post(
  '/notes',
  ensureAuthenticatedForWeb,
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters.'),
    body('content').trim().notEmpty().withMessage('Content is required.'),
    body('color')
      .optional()
      .isIn(['white', 'yellow', 'blue', 'pink', 'green'])
      .withMessage('Invalid color specified.'),
  ],
  catchAsync(async (req, res) => {
    const errors = validationResult(req);
    const formData = req.body;

    if (!errors.isEmpty()) {
      return res.render('notes/new', {
        pageTitle: 'Create New Note',
        errors: errors.array(),
        formData: formData,
      });
    }
    let tagsArray = [];
    if (
      formData.tags &&
      typeof formData.tags === 'string' &&
      formData.tags.trim() !== ''
    ) {
      tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== '');
    }
    const isPinned = formData.isPinned === 'true';

    const noteData = {
      title: formData.title,
      content: formData.content,
      userId: req.user._id,
      tags: tagsArray,
      color: formData.color || 'white',
      isPinned: isPinned,
    };
    await notesHandler.createNote(noteData);

    req.flash('success', 'Note created successfully!');
    res.redirect('/notes');
  })
);

webRouter.get(
  '/notes/:id/edit',
  ensureAuthenticatedForWeb,
  [param('id').isMongoId().withMessage('Invalid note ID format.')],
  catchAsync(async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      req.flash(
        'error',
        validationErrors
          .array()
          .map((e) => e.msg)
          .join('<br>')
      );
      return res.redirect('/notes');
    }

    const noteId = req.params.id;
    const userId = req.user._id;

    const noteToEdit = await notesHandler.getNoteByIdForUser(noteId, userId);

    if (!noteToEdit) {
      req.flash(
        'error',
        'Note not found or you are not authorized to edit it.'
      );
      return res.redirect('/notes');
    }

    res.render('notes/edit', {
      pageTitle: 'Edit Note',
      note: noteToEdit,
      formData: noteToEdit,
      errors: [],
    });
  })
);

// Update an existing note
webRouter.put(
  '/notes/:id',
  ensureAuthenticatedForWeb,
  [
    param('id').isMongoId().withMessage('Invalid note ID format.'),
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required.')
      .isLength({ max: 100 })
      .withMessage('Title cannot exceed 100 characters.'),
    body('content').trim().notEmpty().withMessage('Content is required.'),
    body('color')
      .optional({ checkFalsy: true })
      .isIn(['white', 'yellow', 'blue', 'green', 'pink'])
      .withMessage('Invalid color specified.'),
  ],
  catchAsync(async (req, res) => {
    const noteId = req.params.id;
    const userId = req.user._id;
    const errors = validationResult(req);
    const submittedData = req.body;

    if (!errors.isEmpty()) {
      const noteForForm = await notesHandler.getNoteByIdForUser(noteId, userId);

      if (!noteForForm) {
        req.flash(
          'error',
          'Note not found or you are not authorized to edit it.'
        );
        return res.redirect('/notes');
      }

      return res.render('notes/edit', {
        pageTitle: 'Edit Note',
        errors: errors.array(),
        note: noteForForm,
        formData: submittedData,
      });
    }

    let tagsArray = [];
    if (submittedData.tags && typeof submittedData.tags === 'string') {
      tagsArray = submittedData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== '');
    }

    const isPinned = submittedData.isPinned === 'true';

    const updateData = {
      title: submittedData.title,
      content: submittedData.content,
      tags: tagsArray,
      color: submittedData.color || 'white',
      isPinned: isPinned,
    };

    const updatedNote = await notesHandler.updateNoteById(
      noteId,
      userId,
      updateData
    );

    if (!updatedNote) {
      req.flash(
        'error',
        'Failed to update note. Note not found or you are not authorized.'
      );
      return res.redirect('/notes');
    }

    req.flash('success', 'Note updated successfully!');
    res.redirect('/notes');
  })
);

webRouter.post(
  '/notes/:id/delete',
  ensureAuthenticatedForWeb,
  [param('id').isMongoId().withMessage('Invalid note ID format.')],
  catchAsync(async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      req.flash(
        'error',
        validationErrors
          .array()
          .map((e) => e.msg)
          .join('<br>')
      );
      return res.redirect('/notes');
    }
    const noteId = req.params.id;
    const userId = req.user._id;

    const deletedNote = await notesHandler.deleteNoteById(noteId, userId);

    if (!deletedNote) {
      req.flash('error', 'Failed to delete note.');
    } else {
      req.flash('success', 'Note deleted successfully!');
    }
    res.redirect('/notes');
  })
);

export default webRouter;
