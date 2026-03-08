# GymFlow

Modern gym management system for fitness centers and gyms.

**Live Demo**: [gymflow.pages.dev](https://gymflow.pages.dev)

## Features

### For Gym Owners

**Member Management**
- Approve/reject member registrations
- Assign membership plans
- Track member status (active, expiring, expired)
- View member details and contact information

**Membership Plans**
- Create custom plans with flexible durations
- Set pricing and features
- Manage multiple plan tiers
- Track active subscriptions

**Schedule Management**
- Set multiple time slots per day
- Configure weekly schedules
- Add holidays and closures
- Recurring weekly holidays

**Analytics Dashboard**
- Total members and revenue tracking
- Daily check-in monitoring
- Membership expiration alerts
- Pending approval notifications

**Business Profile**
- Customize gym information
- Set location and contact details
- Configure payment information
- Generate unique access codes

### For Members

**Self Registration**
- Register using gym access code
- Create account and profile
- Wait for owner approval

**Membership Portal**
- View current plan and expiration
- Check gym schedule and hours
- See upcoming holidays
- Access gym contact information

**Check-in System**
- Quick check-in/check-out
- Track visit history
- View daily visit duration
- Monitor total time spent

**Profile Management**
- Update personal information
- Manage contact details
- View membership status

## Tech Stack

- React 18 + TypeScript
- Express.js + PostgreSQL
- Tailwind CSS + Radix UI
- JWT Authentication

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
git clone <repository-url>
cd gymflow
npm install
cd server && npm install && cd ..
```

### Database Setup

```bash
psql -U postgres -c "CREATE DATABASE gym_management;"
psql -U postgres -d gym_management -f database/schema.sql
```

### Configuration

Create `server/.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_management
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

Update `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Run

```bash
cd server && npm run dev
```

In another terminal:
```bash
npm run dev
```

Access at http://localhost:8080

## Documentation

Developer documentation in [/docs](docs):

- [Setup Guide](docs/SETUP.md)
- [API Documentation](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Deployment](docs/DEPLOYMENT.md)

## License

MIT
