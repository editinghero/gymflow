# PostgreSQL Setup Guide

## Windows Installation

### Option 1: Using Official Installer
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the postgres user
4. Default port is 5432

### Option 2: Using Chocolatey
```powershell
choco install postgresql
```

### Option 3: Using Scoop
```powershell
scoop install postgresql
```

## Database Setup

1. Open Command Prompt or PowerShell as Administrator

2. Connect to PostgreSQL:
```cmd
psql -U postgres
```

3. Create the database:
```sql
CREATE DATABASE gym_management;
```

4. Connect to the database:
```cmd
\c gym_management
```

5. Run the schema file:
```cmd
psql -U postgres -d gym_management -f database/schema.sql
```

Or from psql prompt:
```sql
\i database/schema.sql
```

## Environment Configuration

Create or update your `.env` file with:
```
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=gym_management
VITE_DB_USER=postgres
VITE_DB_PASSWORD=your_password
```

## Verify Installation

```cmd
psql -U postgres -d gym_management -c "\dt"
```

This should list all the tables created.
