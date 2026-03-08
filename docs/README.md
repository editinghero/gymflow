# Developer Documentation

## Quick Links

- [Setup](SETUP.md)
- [Database](DATABASE.md)
- [API](API.md)
- [Architecture](ARCHITECTURE.md)
- [Deployment](DEPLOYMENT.md)
- [Troubleshooting](TROUBLESHOOTING.md)

## Getting Started

```bash
git clone <repo>
cd gymflow
npm install
cd server && npm install && cd ..
```

Setup database:
```bash
psql -U postgres -c "CREATE DATABASE gym_management;"
psql -U postgres -d gym_management -f database/schema.sql
```

Configure:
- `server/.env`
- `.env`

Run:
```bash
cd server && npm run dev
npm run dev
```

## Project Structure

```
gymflow/
├── src/              Frontend
├── server/           Backend API
├── database/         Schema
├── docs/             Documentation
└── public/           Assets
```

## Stack

- React 18 + TypeScript
- Express.js + PostgreSQL
- Tailwind CSS + Radix UI
- JWT Auth
