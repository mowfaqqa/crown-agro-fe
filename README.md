# ZD Crown Frontend

Next.js customer marketplace and admin dashboard shell for ZD Crown.

## Stack

- Next.js App Router
- TypeScript
- React Query
- Tailwind CSS
- Lucide icons

## Setup

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

The app runs on `http://localhost:3000` by default and expects the backend at `NEXT_PUBLIC_API_URL`.

## Current Milestone

- Search-first homepage
- Marketplace sorting, pagination, origin, certification, and stock filters
- Customer registration and JWT login
- Email verification, password recovery, Google sign-in, and persistent sessions
- Account-scoped cart and authenticated checkout flow
- Customer profile and order-history dashboard
- Dedicated product, cart, checkout, and order lookup pages
- Newsletter capture
- Admin JWT login, product management, and controlled order fulfillment
- Loading, empty, and backend-offline recovery states

Next milestones should add broader automated tests, managed image uploads, and Paystack checkout.
