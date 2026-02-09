import { Schema, model } from 'mongoose';

export interface IAdminUser {
  username: string;
  passwordHash: string;
  createdAt?: Date;
}

const AdminUserSchema = new Schema<IAdminUser>({
  username: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const AdminUser = model<IAdminUser>('AdminUser', AdminUserSchema);
