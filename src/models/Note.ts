import { Schema, model } from 'mongoose';

export interface INote {
  key: string; // e.g., 'admin'
  content: string;
  updatedAt?: Date;
}

const NoteSchema = new Schema<INote>({
  key: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

NoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Note = model<INote>('Note', NoteSchema);
