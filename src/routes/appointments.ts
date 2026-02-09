import { Router, Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { sendEmail, sendWhatsApp } from '../utils/notify';

export const router = Router();

const DEFAULT_SLOTS = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00'];

router.get('/availability', async (req: Request, res: Response) => {
  const { date } = req.query as { date?: string };
  if (!date) return res.status(400).json({ error: 'date is required' });
  const taken = await Appointment.find({ date }).select('time').lean();
  const takenSet = new Set(taken.map(t => t.time));
  const available = DEFAULT_SLOTS.filter(t => !takenSet.has(t));
  return res.json({ date, slots: available });
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, date, time, type } = req.body as { name?: string; email?: string; phone?: string; date?: string; time?: string; type?: string };
    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({ error: 'missing fields' });
    }
    const appt = await Appointment.create({ name, email, phone, date, time, type: type || 'Consulta', status: 'pending' });
    return res.status(201).json(appt);
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'slot already reserved' });
    }
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// Auth desativada: endpoints de confirmação/cancelamento públicos
router.patch('/:id/confirm', async (req: Request, res: Response) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, { status: 'confirmed' }, { new: true });
    if (!appt) return res.status(404).json({ error: 'not found' });
    await sendEmail(appt.email, 'Confirmação de Consulta', `Sua consulta foi confirmada para ${appt.date} às ${appt.time}.`);
    await sendWhatsApp(appt.phone, `Consulta confirmada em Clinica Sorriso: ${appt.date} ${appt.time}.`);
    return res.json(appt);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

router.patch('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!appt) return res.status(404).json({ error: 'not found' });
    await sendEmail(appt.email, 'Cancelamento de Consulta', `Sua consulta em ${appt.date} às ${appt.time} foi cancelada. Para remarcar, responda esta mensagem.`);
    await sendWhatsApp(appt.phone, `Sua consulta (${appt.date} ${appt.time}) foi cancelada. Responda para remarcar.`);
    return res.json(appt);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});
