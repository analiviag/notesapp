import Notes from '../models/note.js';

// Function to get all notes (not currently used by routes)
const getAllNotes = async () => {
  return await Notes.find().lean();
};

// Function to get notes for a specific user
const getNotesByUserId = async (userId) => {
  return await Notes.find({ userId: userId })
    .sort({ isPinned: -1, updatedAt: -1 })
    .lean();
};

// Function to create a new note
const createNote = async (noteData) => {
  const newNote = new Notes(noteData);
  return await newNote.save();
};

// Function to update a note by ID, ensuring user ownership
const updateNoteById = async (noteId, userId, updateData) => {
  return await Notes.findOneAndUpdate(
    { _id: noteId, userId: userId },
    updateData,
    { new: true, runValidators: true }
  ).lean();
};

// Function to delete a note by ID, ensuring user ownership
const deleteNoteById = async (noteId, userId) => {
  return await Notes.findOneAndDelete({
    _id: noteId,
    userId: userId,
  }).lean();
};

// Function to get a single note by ID for a specific user
const getNoteByIdForUser = async (noteId, userId) => {
  return await Notes.findOne({ _id: noteId, userId: userId }).lean();
};

// Function to toggle the isPinned status of a note
const togglePinStatus = async (noteId, userId) => {
  const note = await Notes.findOne({ _id: noteId, userId: userId });

  if (!note) {
    return null;
  }

  note.isPinned = !note.isPinned;
  note.updatedAt = Date.now();
  return await note.save();
};

export default {
  getAllNotes,
  getNotesByUserId,
  createNote,
  updateNoteById,
  deleteNoteById,
  getNoteByIdForUser,
  togglePinStatus,
};
