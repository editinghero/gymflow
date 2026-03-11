# Setup (PostgreSQL / Neon)

This project uses an Express backend with a PostgreSQL database.

You can run it with:

- Local PostgreSQL (recommended for development)
- Neon (free hosted Postgres) (recommended if you don’t want to install Postgres locally)

## 1) Requirements

- Node.js 18+
- npm

If you’re using local Postgres:

- PostgreSQL 14+

## 2) Install dependencies

From the project root:

```bash
npm install
```

Then install backend dependencies:

```bash
cd server
npm install
```

## 3) Database setup

### Option A: Local PostgreSQL

1. Install PostgreSQL

Windows download:

- https://www.postgresql.org/download/windows/

2. Create a database

```bash
psql -U postgres -c "CREATE DATABASE gym_management;"
```

3. Create tables

Run the schema:

```bash
psql -U postgres -d gym_management -f database/schema.sql
```

### Option B: Neon (free hosted PostgreSQL)

1. Create a Neon project
2. Copy your connection string (`DATABASE_URL`)

It looks like this:

```txt
postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

3. Create tables

Open Neon SQL editor and run the contents of:

- `database/schema.sql`

## 4) Environment variables

### Backend (`server/.env`)

Create `server/.env`:

```env
PORT=5000
JWT_SECRET=replace_me

# Option A (local postgres)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_management
DB_USER=postgres
DB_PASSWORD=your_password

# Option B (Neon / hosted postgres)
# DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

Notes:

- If you set `DATABASE_URL`, the backend should use that instead of the local DB fields.
- Keep `JWT_SECRET` private.

### Frontend (root `.env`)

Create a root `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

## 5) Run the app

### Start backend

```bash
cd server
npm run dev
```

### Start frontend (new terminal)

From the project root:

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:8080`).

## 6) Quick verification

- If you can sign up/sign in, your backend is working.
- If the UI loads but actions fail, double-check:
  - `VITE_API_URL`
  - `server/.env`
  - Postgres is running (for local)
