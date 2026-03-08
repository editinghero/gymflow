# Deployment

## Frontend

**Cloudflare Pages**

Build command: `npm run build`
Output: `dist`

Environment:
```
VITE_API_URL=https://api.yourdomain.com/api
```

## Backend

**Requirements**
- Node.js 18+
- PostgreSQL

**Environment**
```
PORT=3000
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=gym_management
DB_USER=your-user
DB_PASSWORD=your-password
JWT_SECRET=your-secret
```

**Deploy**
```bash
cd server
npm install
npm run build
npm start
```

## Database

Use managed PostgreSQL:
- AWS RDS
- Digital Ocean
- Heroku Postgres
- Supabase (PostgreSQL only)

Run `database/schema.sql` on production DB
