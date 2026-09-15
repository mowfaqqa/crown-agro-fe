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
- Marketplace product grid
- Guest cart and order request flow
- Newsletter capture
- Admin JWT login and protected stats foundation

Next milestones should add admin product CRUD, order management, image uploads, and Paystack checkout.
