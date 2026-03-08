# Architecture

## Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Radix UI
- React Router
- TanStack Query

**Backend**
- Express.js
- PostgreSQL
- JWT + bcrypt

## Structure

```
├── src/
│   ├── components/
│   │   ├── customer/
│   │   ├── owner/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   └── types/
├── server/
│   └── src/
│       ├── routes/
│       ├── middleware/
│       └── db.ts
├── database/
│   └── schema.sql
└── public/
```

## Auth Flow

1. User signs up/in
2. Backend validates + generates JWT
3. Token stored in localStorage
4. Token sent with all requests
5. Middleware validates token

## Database

**Core Tables**

- users: Auth data
- profiles: User info
- user_roles: Role assignments
- businesses: Gym details
- plans: Membership plans
- members: Gym members
- schedules: Working hours
- holidays: Closed dates
- check_ins: Visit records

**Relations**

- users → profiles (1:1)
- users → user_roles (1:many)
- users → businesses (1:many)
- businesses → plans (1:many)
- businesses → members (1:many)
- members → check_ins (1:many)

## State

- React hooks for local state
- TanStack Query for server state
- localStorage for auth
