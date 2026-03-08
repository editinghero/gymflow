# Setup

## Requirements

- Node.js 18+
- PostgreSQL 14+

## Database

```bash
psql -U postgres -c "CREATE DATABASE gym_management;"
psql -U postgres -d gym_management -f database/schema.sql
```

## Backend

```bash
cd server
npm install
```

Create `server/.env`:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=random_secret_key
```

Start:

```bash
npm run dev
```

## Frontend

```bash
npm install
```

Update `.env`:

```
VITE_API_URL=http://localhost:3000/api
```

Start:

```bash
npm run dev
```

Access: http://localhost:8080
