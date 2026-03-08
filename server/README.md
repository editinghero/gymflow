# GymFlow Backend

Express.js API server for GymFlow.

## Setup

Create `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

Install:

```bash
npm install
```

Run:

```bash
npm run dev
```

## Endpoints

### Auth
- POST /api/auth/signup
- POST /api/auth/signin

### Data
- GET /api/:table
- POST /api/:table
- PATCH /api/:table
- DELETE /api/:table
