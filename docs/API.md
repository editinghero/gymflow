# API

Base: `http://localhost:3000/api`

## Auth

### Signup

```
POST /auth/signup
{
  "email": "user@example.com",
  "password": "password",
  "fullName": "John Doe"
}
```

### Signin

```
POST /auth/signin
{
  "email": "user@example.com",
  "password": "password"
}
```

Returns JWT token.

## Data

All endpoints require `Authorization: Bearer {token}`

### Query

```
GET /api/{table}
GET /api/{table}?column=eq.value
```

### Create

```
POST /api/{table}
{ "field": "value" }
```

### Update

```
PATCH /api/{table}?id=eq.{id}
{ "field": "new_value" }
```

### Delete

```
DELETE /api/{table}?id=eq.{id}
```

## Tables

- businesses
- plans
- members
- schedules
- holidays
- check_ins
- profiles
- user_roles
