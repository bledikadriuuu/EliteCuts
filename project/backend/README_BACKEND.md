# Backend setup (Windows)

## Requirements
- Node.js 18+
- MongoDB running locally or a connection string

## Setup
1) Open PowerShell in the repo
2) `cd project\backend`
3) `npm install`
4) Copy `.env.example` to `.env` and fill values
5) (Optional) `npm run seed` (creates services and barber if BARBER_* env vars are set)
6) `npm run dev`

## Frontend compatibility
- Set `VITE_SUPABASE_URL` in the frontend to `http://localhost:4000`
- Set `VITE_SUPABASE_ANON_KEY` to any non-empty string

## Demo workflow
1) Start MongoDB
2) Start backend
3) Start frontend
4) Create barber account using `/api/auth/create-barber`
5) User signup and login
6) User books/reschedules/cancels -> Telegram notifications are sent
7) Barber logs in and manages appointments

## Telegram bot setup
1) Open Telegram and chat with `@BotFather`
2) Create a new bot and copy the token
3) Start a chat with your bot and send a message
4) Open the URL: `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates`
5) Copy the `chat.id` from the response
6) Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env`

## API endpoints

### Auth
POST /api/auth/signup
Body:
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "+383123456",
  "password": "password123"
}

POST /api/auth/login
Body:
{
  "email": "customer@example.com",
  "password": "password123"
}

POST /api/auth/create-barber
Headers: `x-setup-secret: <SETUP_SECRET>`
Body:
{
  "name": "Barber Name",
  "email": "barber@example.com",
  "phone": "+383123456",
  "password": "password123"
}

GET /api/me
Header: `Authorization: Bearer <token>`

### Services
GET /api/services

### Availability
GET /api/availability?date=YYYY-MM-DD

### Appointments (API)
POST /api/appointments
Header: `Authorization: Bearer <token>`
Body:
{
  "serviceId": "<service uuid>",
  "date": "2025-12-31",
  "time": "13:30",
  "notes": "Optional"
}

GET /api/appointments?page=1&limit=20&sort=asc
Header: `Authorization: Bearer <token>`

PATCH /api/appointments/:id
Body:
{
  "date": "2025-12-31",
  "time": "15:00",
  "notes": "Optional"
}

DELETE /api/appointments/:id

PATCH /api/appointments/:id/confirm
PATCH /api/appointments/:id/reschedule
Body:
{
  "date": "2025-12-31",
  "time": "15:00"
}

PATCH /api/appointments/:id/cancel
DELETE /api/appointments/:id

### Supabase-compatible (frontend)
GET /rest/v1/services?select=*&order=price.asc
POST /rest/v1/appointments

## Common errors
- 400 Invalid request: request body failed validation
- 401 Unauthorized: missing or invalid token
- 403 Forbidden: wrong role
- 409 Time slot already booked
- 500 Server error
