# Clínica Sorriso — Backend

Express + MongoDB para agendamentos; deploy no Render.

## Rodar localmente

```bash
cd Backend
npm install
copy .env.example .env
# edite .env com MONGO_URI (ex.: mongodb://127.0.0.1:27017/clinica_sorriso)
npm run dev   # roda com tsx (TypeScript)
```

Endpoints:
- `GET /appointments/availability?date=YYYY-MM-DD`
- `POST /appointments { name, email, phone, date, time, type }`
- `POST /admin/login { username, password }` → retorna `token`
- `GET /admin/appointments` (Bearer token)
- `PATCH /appointments/:id/confirm` (confirma e dispara e-mail/WhatsApp)
- `PATCH /appointments/:id/cancel` (cancela e dispara e-mail/WhatsApp)
- `POST /admin/seed` (cria exemplos relativos ao mês atual)

Integração com Frontend:
- No Vercel/Local, configure `NEXT_PUBLIC_API_URL` apontando para a URL do Render/local: ex.: `http://localhost:4000` ou `https://seu-backend.onrender.com`.

Notificações:
- Configure SMTP em `.env` para e-mail. Sem configuração, cai em stub (log).
- Configure Twilio WhatsApp em `.env`. Sem configuração, cai em stub (log).

## Deploy no Render
- Novo Web Service → Node.
- `Build Command`: `npm install && npm run build`
- `Start Command`: `npm start` (executa `node dist/server.js`)
- Variáveis de ambiente: `MONGO_URI`, `ADMIN_*`, `JWT_SECRET`, opcional SMTP/Twilio.
- Habilite `Auto Deploy`.

Importante: o Render define `PORT` automaticamente. O backend já usa `process.env.PORT` por padrão.

## Seed de exemplos (mês atual)

- Rode `npm run seed` para popular agendamentos de exemplo relativos ao mês atual.
- Também há o endpoint `POST /admin/seed` para criar/aplicar esses exemplos via API.
- Isso facilita demonstração contínua sem ajustar datas manualmente.
