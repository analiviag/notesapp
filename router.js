import { Router } from 'express';
import notesController from './src/controllers/notesController.js';
import userController from './src/controllers/userController.js';
import isAuthenticated from './src/middleware/isAuthenticated.js';
import {
  validateUserRegistration,
  validateNoteCreation,
  validateNoteUpdate,
  validateNoteId,
} from './src/middleware/validators.js';
import { param } from 'express-validator';
import catchAsync from './src/utils/catchAsync.js';

export const router = Router();

//Notes routes
router.get(
  '/notetaking',
  isAuthenticated,
  catchAsync(notesController.getNotes)
);
router.post(
  '/notetaking',
  isAuthenticated,
  validateNoteCreation,
  catchAsync(notesController.createNote)
);

//Update and delete routes
router.put(
  '/notetaking/:noteId',
  isAuthenticated,
  validateNoteId,
  validateNoteUpdate,
  catchAsync(notesController.updateNote)
);
router.delete(
  '/notetaking/:noteId',
  isAuthenticated,
  validateNoteId,
  catchAsync(notesController.deleteNote)
);

//User routes
router.post(
  '/register',
  validateUserRegistration,
  catchAsync(userController.registerUser)
);
router.get(
  '/users/:userId',
  isAuthenticated,
  [param('userId').isMongoId().withMessage('Invalid user ID format.')],
  catchAsync(userController.getUserById)
);
router.post('/login', userController.loginUser);
router.post('/logout', userController.logoutUser);

//Toggling pin status
router.patch(
  '/notetaking/:noteId/toggle-pin',
  isAuthenticated,
  validateNoteId,
  catchAsync(notesController.toggleNotePinStatus)
);
