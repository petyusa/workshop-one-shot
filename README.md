## Workspace Flow – Booking Experience

A polished booking demo for reserving desks, rooms, parking spots, and focus pods across multiple office locations. The experience includes mock authentication, owner approvals, opening-hour enforcement, and an insights dashboard for office managers.

### Tech Stack

- Next.js 15 App Router with TypeScript
- Tailwind CSS for styling
- Prisma ORM with SQLite (file-based) for persistence
- Zustand for lightweight client state
- Zod for request validation
- Vitest & Testing Library for unit/UI tests

### Feature Highlights

- Mock login with role awareness (employees vs. managers)
- Multi-location catalogue of reservable spaces with availability states
- Reservation workflow with start/end time validation and opening window checks
- Owner-only spaces that trigger approval requests and manager decision flow
- Floor plan grid view for a quick spatial snapshot
- Manager dashboard with occupancy stats, pending approvals, and activity feed
- API routes for auth, locations, spaces, reservations, and request management

### Seeded Mock Accounts

| Name | Email | Role | Notes |
| --- | --- | --- | --- |
| Amelia Singh | `amelia.manager@workspace.com` | Manager | Downtown HQ admin & parking owner |
| Noah Patel | `noah.manager@workspace.com` | Manager | Innovation Hub admin |
| Olivia Chen | `olivia.chen@workspace.com` | Employee | Design desk owner & Downtown admin |
| Liam Torres | `liam.torres@workspace.com` | Employee | Sample reservation + owner request |
| Emma Robinson | `emma.robinson@workspace.com` | Employee | Meeting room reservation |
| Ethan Wu | `ethan.wu@workspace.com` | Employee | Phone booth occupant |

Log in via the "Quick login" panel and switch between personas to explore owner approvals and management views.

## Getting Started

### Prerequisites

- Node.js 18.18+ (or 20+)
- npm 9+

### Installation & Database Setup

```bash
npm install
npm run db:migrate
npm run db:seed
```

The commands create the SQLite database (`prisma/dev.db`), apply the initial migration, and load the mock dataset.

### Run the App

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the application. The UI auto-reloads on code changes.

### Quality Checks

- Lint: `npm run lint`
- Tests: `npm run test`

### Build for Production

```bash
npm run build
npm run start
```

## API Overview

All routes live under `/api/*` and respond with JSON. Key endpoints:

- `POST /api/login` – fetch mock user profile by email or ID
- `GET /api/users` – list available mock users for login
- `GET /api/locations` – aggregate stats per location
- `GET /api/spaces?locationId=&includeOpening=` – spaces with upcoming reservations & opening windows
- `GET/POST /api/reservations` – list and create reservations (auto request when owner-only)
- `PATCH/DELETE /api/reservations/:id` – update status or cancel
- `GET/POST /api/requests` – list owner approval requests or submit via reservation flow
- `PATCH /api/requests/:id` – manager/owner approves or declines a pending request

## Project Structure

- `prisma/schema.prisma` – database schema & enums for roles, spaces, reservations, requests
- `prisma/seed.ts` – deterministic seed data with multi-location layout and sample bookings
- `src/app/api/*` – Next.js route handlers that expose booking operations
- `src/components/*` – UI building blocks (login panel, reservation dialog, dashboard widgets, floor plan)
- `src/lib/*` – Prisma client, reservation helpers, and time utilities
- `src/store/app-store.ts` – Zustand store for session + location selection
- `src/types/index.ts` – shared API DTO typing

## Testing

Vitest is configured with jsdom + Testing Library extensions.

- Unit tests live next to source files (e.g., `src/lib/time.test.ts`).
- Add more coverage for components or API utilities using `describe/it` blocks and Testing Library helpers.

Run the full suite with `npm run test`.

## Extending the Demo

- Swap SQLite for Postgres by updating `DATABASE_URL` in `.env`
- Integrate real auth (e.g., NextAuth) and replace mock login store
- Wire email/slack notifications when owner approvals are required
- Add analytics charts by location or by space type over time
- Move reservation validation into server actions for stronger guarantees

Enjoy exploring the booking flow! Contributions and enhancements are welcome.
