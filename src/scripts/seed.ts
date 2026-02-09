import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment';

dotenv.config();

const MONGO_URI = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinica_sorriso').trim();

async function upsertSample(date: string, time: string, data: any) {
  await Appointment.updateOne(
    { date, time },
    { $setOnInsert: { ...data, date, time } },
    { upsert: true }
  );
}

async function main() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');

  const d = (day: number) => `${yyyy}-${mm}-${String(day).padStart(2, '0')}`;

  const samples = [
    { date: d(5), time: '08:00', name: 'João Silva', email: 'joao@example.com', phone: '+55 11 98765-4321', type: 'Limpeza', status: 'pending' },
    { date: d(5), time: '09:00', name: 'Maria Souza', email: 'maria@example.com', phone: '+55 11 91234-5678', type: 'Consulta', status: 'confirmed' },
    { date: d(10), time: '10:00', name: 'Carlos Pereira', email: 'carlos@example.com', phone: '+55 11 90000-1111', type: 'Canal', status: 'pending' },
    { date: d(15), time: '14:00', name: 'Ana Lima', email: 'ana@example.com', phone: '+55 11 95555-2222', type: 'Clareamento', status: 'cancelled' },
    { date: d(15), time: '15:00', name: 'Pedro Santos', email: 'pedro@example.com', phone: '+55 11 98888-3333', type: 'Aparelho', status: 'pending' },
    { date: d(22), time: '16:00', name: 'Beatriz Alves', email: 'bia@example.com', phone: '+55 11 97777-4444', type: 'Consulta', status: 'confirmed' }
  ];

  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  for (const s of samples) {
    await upsertSample(s.date, s.time, {
      name: s.name,
      email: s.email,
      phone: s.phone,
      type: s.type,
      status: s.status
    });
  }

  console.log(`Seed completo: ${samples.length} agendamentos (upsert).`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
}).finally(() => {
  process.exit(0);
});
