# GymFlow

Modern gym management system for gyms.

**Live demo**: [gymflowview.pages.dev](https://gymflowview.pages.dev)

*This contain the demo version to and the sample login credentials.*

## Features
<details>
<summary>For Gym Owners</summary>

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
</details>

<details>
<summary>For Members</summary>

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
</details>

## Tech Stack

- React + TypeScript
- Express.js + PostgreSQL

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation & Database Setup
Refer to the [Setup](docs/setup.md) documentation for detailed instructions.

## Docs

All docs are in [/docs](docs).

- [Setup (PostgreSQL / Neon)](docs/setup.md)
- [API](docs/API.md)

## License

MIT
