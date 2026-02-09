import nodemailer from 'nodemailer';
import twilio from 'twilio';

export async function sendEmail(to: string, subject: string, text: string) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log('[email:stub]', { to, subject, text });
    return;
  }
  const transporter = nodemailer.createTransport({ host, port, secure: false, auth: { user, pass } });
  await transporter.sendMail({ from: user, to, subject, text });
}

export async function sendWhatsApp(toPhone: string, message: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g., 'whatsapp:+14155238886'

  if (!sid || !token || !from) {
    console.log('[whatsapp:stub]', { toPhone, message });
    return;
  }
  const client = twilio(sid, token);
  await client.messages.create({ from, to: `whatsapp:${toPhone}`, body: message });
}
