import { Note, Attachment } from '../types';
import { INITIAL_NOTES } from '../constants';

// Changed to English to strictly follow coding guidelines
const STORAGE_KEY = 'data_analysis_school_notes_v1';

// Simulating async database operations
export const NoteService = {
  
  // Get all notes
  getNotes: async (): Promise<Note[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const storedData = localStorage.getItem(STORAGE_KEY);
          if (storedData) {
            resolve(JSON.parse(storedData));
          } else {
            // First time load: save initial mock data then return it
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NOTES));
            resolve(INITIAL_NOTES);
          }
        } catch (error) {
          console.error("Error loading notes", error);
          resolve(INITIAL_NOTES);
        }
      }, 300); // Simulate network delay
    });
  },

  // Save a new note
  addNote: async (note: Note): Promise<Note> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const storedData = localStorage.getItem(STORAGE_KEY);
          const notes: Note[] = storedData ? JSON.parse(storedData) : [];
          const updatedNotes = [note, ...notes];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
          resolve(note);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  // Delete a note
  deleteNote: async (noteId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const storedData = localStorage.getItem(STORAGE_KEY);
          if (!storedData) {
            resolve(); 
            return;
          }
          const notes: Note[] = JSON.parse(storedData);
          const updatedNotes = notes.filter(n => n.id !== noteId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  // Helper to process file to Base64
  convertFileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
};