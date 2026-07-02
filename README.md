# ConvoPhile

ConvoPhile is a full-stack real time chat application using reactive state management, secure session authentication, and user presence tracking, along with responsive UI with native support for dark mode.

## Live Links

- [Frontend (Vercel)](https://convophile.vercel.app)
- [Backend (Render)](https://convophile.onrender.com)

## Tech Stack

### Frontend

- **Core:** React, Vite
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **Real-Time Client:** Socket.io-Client

### Backend

- **Core:** Node.js, Express
- **Database:** PostgreSQL (Prisma ORM)
- **Authentication:** JSON Web Tokens (JWT) with secure http-only cookies
- **Real-Time Gateway:** Socket.io

## Core Features

- Authenticated Web Socket Channel
- Online Presence Map
- Secure HTTP Authentication with JWT and http-only cookies
- Secure Authorization using RouteProtect leveraging cookies and React Router
- Typing Indicator on Keypress
- Secure Log Out using window.location.href to restore to a clean state
- Global dark mode support with responsive UI
- Auto scroll to last message

## Database schema

Contained in `/backend/prisma/schema.prisma`

## Local Installation

1. Clone the Repository

```
git clone https://github.com/Cactuss26/Convophile.git
cd Convophile

```

2. Initialize backend

```
cd backend
npm install
npx prisma generate
npx prisma db push
npm start (or node --watch server.js)

```

3. Initialize frontend

```
cd ../frontend
npm install
npm run dev
```


## Environment Variables configuration

### Backend (`/backend/.env`)

```
PORT=3000
DATABASE_URL="database-url-string"
JWT_SECRET="jwt-secret-string"
FRONTEND_URL="vercel-url"
NODE_ENV="production"
``` 

### Frontend (`/frontend/.env`)

```
VITE_BACKEND_URL="render-url"
```