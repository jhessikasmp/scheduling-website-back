import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Appointment } from '../models/Appointment';
import { AdminUser } from '../models/AdminUser';
import { Note } from '../models/Note';

export const router = Router();

const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

function auth(req: Request, res: Response, next: Function) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'no token' });
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) return res.status(400).json({ error: 'missing credentials' });
  // Primeiro tenta no banco
  const user = await AdminUser.findOne({ username }).lean();
  if (user) {
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (ok) {
      const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token });
    }
  }
  // Fallback para credenciais do .env (para primeiro acesso)
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ role: 'admin', username }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'invalid credentials' });
});

// Criar novo usuário admin (protegido)
router.post('/users', auth as any, async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) return res.status(400).json({ error: 'missing fields' });
    if (String(username).length < 3) return res.status(400).json({ error: 'username too short' });
    if (String(password).length < 6) return res.status(400).json({ error: 'password too short' });
    const exists = await AdminUser.findOne({ username }).lean();
    if (exists) return res.status(409).json({ error: 'username already exists' });
    const passwordHash = await bcrypt.hash(String(password), 10);
    const created = await AdminUser.create({ username, passwordHash });
    return res.status(201).json({ id: created._id, username: created.username });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

router.get('/appointments', async (req: Request, res: Response) => {
  const { date, status } = req.query as { date?: string; status?: 'pending'|'confirmed'|'cancelled' };
  const q: any = {};
  if (date) q.date = String(date);
  if (status && ['pending','confirmed','cancelled'].includes(String(status))) q.status = String(status);
  const list = await Appointment.find(q).sort({ createdAt: -1 }).lean();
  return res.json(list);
});

// Notas administrativas (público conforme requisito atual)
router.get('/notes', async (_req: Request, res: Response) => {
  try {
    const note = await Note.findOne({ key: 'admin' }).lean();
    return res.json({ content: note?.content || '' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

router.put('/notes', async (req: Request, res: Response) => {
  try {
    const { content } = req.body as { content?: string };
    if (typeof content !== 'string') return res.status(400).json({ error: 'invalid content' });
    const saved = await Note.findOneAndUpdate(
      { key: 'admin' },
      { content, updatedAt: new Date() },
      { upsert: true, new: true }
    ).lean();
    return res.json({ content: saved.content });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// Seed de exemplos via API
router.post('/seed', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const d = (day: number) => `${yyyy}-${mm}-${String(day).padStart(2, '0')}`;
    const samples = [
      { date: d(5), time: '08:00', name: 'João Silva', email: 'joao@example.com', phone: '+55 11 98765-4321', type: 'Limpeza', status: 'pending' },
      { date: d(5), time: '09:00', name: 'Maria Souza', email: 'maria@example.com', phone: '+55 11 91234-5678', type: 'Consulta', status: 'confirmed' },
      { date: d(10), time: '10:00', name: 'Carlos Pereira', email: 'carlos@example.com', phone: '+55 11 90000-1111', type: 'Canal', status: 'pending' },
      { date: d(15), time: '14:00', name: 'Ana Lima', email: 'ana@example.com', phone: '+55 11 95555-2222', type: 'Clareamento', status: 'cancelled' }
    ];
    for (const s of samples) {
      await Appointment.updateOne(
        { date: s.date, time: s.time },
        { $setOnInsert: { name: s.name, email: s.email, phone: s.phone, type: s.type, status: s.status, date: s.date, time: s.time } },
        { upsert: true }
      );
    }
    return res.json({ inserted: samples.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});
