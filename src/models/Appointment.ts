import { Schema, model } from 'mongoose';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface IAppointment {
  name: string;
  email: string;
  phone: string;
  type: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  createdAt?: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  type: { type: String, required: false, default: 'Consulta' },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

AppointmentSchema.index({ date: 1, time: 1 }, { unique: true });

export const Appointment = model<IAppointment>('Appointment', AppointmentSchema);
