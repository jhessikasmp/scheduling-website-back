import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { router as appointmentsRouter } from './routes/appointments';
import { router as adminRouter } from './routes/admin';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/appointments', appointmentsRouter);
app.use('/admin', adminRouter);

app.get('/', (_req, res) => res.json({ status: 'ok', service: 'Clinica Sorriso Backend' }));

const PORT = Number(process.env.PORT || 4000);
const MONGO_URI = (process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/clinica_sorriso').trim();
let dbStatus: 'connected' | 'error' | 'disconnected' = 'disconnected';

mongoose.connect(MONGO_URI).then(() => {
  dbStatus = 'connected';
  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
}).catch(err => {
  dbStatus = 'error';
  console.error('Mongo connection error', err);
  // Não encerrar o servidor; permitir que a API responda com erro em runtime.
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// Health endpoint para verificar status rapidamente
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', db: dbStatus });
});
