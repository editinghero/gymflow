# Database

## Install PostgreSQL

**Windows**

Download: https://www.postgresql.org/download/windows/

Or:
```bash
choco install postgresql
```

**Add to PATH**

Add `C:\Program Files\PostgreSQL\18\bin` to system PATH

## Setup

### Create Database

```bash
psql -U postgres -c "CREATE DATABASE gym_management;"
```

### Load Schema

```bash
psql -U postgres -d gym_management -f database/schema.sql
```

### Verify

```bash
psql -U postgres -d gym_management -c "\dt"
```

Should show: users, profiles, user_roles, businesses, plans, members, schedules, holidays, check_ins

## Using pgAdmin

1. Open pgAdmin
2. Right-click Databases → Create Database
3. Name: gym_management
4. Open Query Tool
5. Paste contents from database/schema.sql
6. Execute
