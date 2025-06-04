import Notes from '../models/note.js';

//Function to get all notes
const getAllNotes = async () => {
  return await Notes.find().lean();
};

//Function to get notes by specific user
const getNotesByUserId = async (userId) => {
  try {
    const notes = await Notes.find({ userId: userId })
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();
    return notes;
  } catch (error) {
    console.error(`Error fetching notes for user ${userId}`, error);
    throw error;
  }
};

//Function to create a new note
const createNote = async (noteData) => {
  try {
    const newNote = new Notes(noteData);
    await newNote.save();
    return newNote;
  } catch (error) {
    console.error('Error creating note', error);
    throw error;
  }
};

//Function to update note by ID
const updateNoteById = async (noteId, userId, updateData) => {
  try {
    const updateNote = await Notes.findOneAndUpdate(
      { _id: noteId, userId: userId },
      updateData,
      { new: true, runValidators: true }
    ).lean();
    return updateNote;
  } catch (error) {
    console.error(`Error updating note ${noteId} for user ${userId}`, error);
    throw error;
  }
};

//Function to delete a note by ID
const deleteNoteById = async (noteId, userId) => {
  try {
    const result = await Notes.findOneAndDelete({
      _id: noteId,
      userId: userId,
    });
    return result;
  } catch (error) {
    console.error(`Error deleting note ${noteId} by user ${userId}.`, error);
    throw error;
  }
};

const getNoteByIdForUser = async (noteId, userId) => {
  try {
    const note = await Notes.findOne({ _id: noteId, userId: userId }).lean();
    return note;
  } catch (error) {
    console.error(`Error fetching note ${noteId} for user ${userId}:`, error);
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return null;
    }
    throw error;
  }
};

// Function to toggle isPinned
const togglePinStatus = async (noteId, userId) => {
  try {
    console.log(userId);
    const note = await Notes.findOne({ _id: noteId, userId: userId });
    if (!note) {
      return null;
    }
    note.isPinned = !note.isPinned;
    note.updatedAt = Date.now();
    await note.save();
    return note;
  } catch (error) {
    console.error(
      `Error toggling pin status for note ${noteId}, user ${userId}:`,
      error
    );
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return null;
    }
    throw error;
  }
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
