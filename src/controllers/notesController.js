import notesHandler from '../handlers/note.js';
import { validationResult } from 'express-validator';

// Function to get notes for the logged-in user
const getNotes = async (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      status: 'fail',
      message: 'User not authenticated. Please log in to view your notes.',
    });
  }
  const userId = req.user._id;

  const notes = await notesHandler.getNotesByUserId(userId);
  res.status(200).json({ status: 'success', data: { notes } });
};

// Function to create a new note
const createNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }

  if (!req.user || !req.user._id) {
    return res.status(401).json({
      status: 'fail',
      message: 'User not authenticated or user ID missing.',
    });
  }
  const userId = req.user._id;
  const noteData = req.body;

  const fullNoteData = {
    ...noteData,
    userId: userId,
  };

  const newNote = await notesHandler.createNote(fullNoteData);
  res.status(201).json({ status: 'success', data: { note: newNote } });
};

//Function to update an existing note
const updateNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }

  const { noteId } = req.params;
  const userId = req.user._id;
  const updateData = req.body;

  if (Object.keys(updateData).length === 0) {
    return res
      .status(400)
      .json({ status: 'fail', message: 'No update data provided.' });
  }

  const updatedNote = await notesHandler.updateNoteById(
    noteId,
    userId,
    updateData
  );

  if (!updatedNote) {
    const err = new Error(
      'Note not found or you do nt have permission to update this note.'
    );
    err.status = 404;
    return next(err);
  }

  res.status(200).json({ status: 'success', data: { note: updatedNote } });
};

//Function to delete a note
const deleteNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }

  const { noteId } = req.params;
  const userId = req.user._id;

  const deletedNote = await notesHandler.deleteNoteById(noteId, userId);

  if (!deletedNote) {
    const err = new Error(
      'Note nout found or you do not have permission to delete this note.'
    );
    err.status = 404;
    return next(err);
  }

  res.status(200).json({
    status: 'success',
    message: 'Note successfully deleted.',
    data: { note: deletedNote },
  });
};

//Function to toggle isPinned status
const toggleNotePinStatus = async (req, res, next) => {
  console.log('User ID performing toggle:', req.user._id);
  const noteId = req.params.noteId;
  const userId = req.user._id;

  const updatedNote = await notesHandler.togglePinStatus(noteId, userId);

  if (!updatedNote) {
    const err = new Error(
      'Note not found or you are not authorized to modify this note.'
    );
    err.statusCode = 404;
    return next(err);
  }

  res.status(200).json({
    status: 'success',
    message: 'Note pin status toggled successfully.',
    data: {
      note: updatedNote,
    },
  });
};

export default {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  toggleNotePinStatus,
};
