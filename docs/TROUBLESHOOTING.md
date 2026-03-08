# Troubleshooting

## Database Connection Failed

Check PostgreSQL is running:
```bash
pg_isready
```

Verify credentials in `server/.env`

Test connection:
```bash
psql -U postgres -d gym_management -c "SELECT 1;"
```

## Port In Use

**Frontend (8080)**

Change in `vite.config.ts`:
```ts
server: { port: 3001 }
```

**Backend (3000)**

Change PORT in `server/.env`

## Module Not Found

```bash
npm install
cd server && npm install
```

## Schema Not Loaded

```bash
psql -U postgres -d gym_management -f database/schema.sql
```

## Invalid Token

Clear browser localStorage:
```js
localStorage.clear()
```

## API Not Responding

- Check backend is running
- Verify VITE_API_URL matches backend PORT
- Check CORS in `server/src/index.ts`
