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

The app runs on `http://localhost:3000` by default and expects the backend at `NEXT_PUBLIC_API_URL`. Set `NEXT_PUBLIC_SITE_URL` to the deployed frontend origin so canonical metadata, `robots.txt`, and `sitemap.xml` use the public URL.

Set `NEXT_PUBLIC_MEDIA_URL` to the same public R2 origin used for the backend's `R2_PUBLIC_BASE_URL`. This allows Next.js to render newly uploaded listing images.

## Current Milestone

- Search-first homepage
- Marketplace sorting, pagination, origin, certification, and stock filters
- Customer registration and JWT login
- Email verification, password recovery, Google sign-in, and persistent sessions
- Account-scoped cart and authenticated checkout flow
- Customer profile with order, service-enquiry, and investment-interest history
- Dedicated product, cart, checkout, and order lookup pages
- Newsletter capture
- Admin JWT login, product management, and controlled order fulfillment
- Admin-managed market intelligence with draft, publish, feature, and archive states
- Public market intelligence search, category filters, and detail pages
- Searchable service directory with authenticated enquiries and admin follow-up
- Preliminary investment opportunity catalogue with non-binding expressions of interest
- Admin queue filters, operational counters, and customer acknowledgement emails
- Route metadata, sitemap, crawl controls, and responsive navigation
- Loading, empty, and backend-offline recovery states
- R2 image uploads for products, services, and opportunities
- Paystack hosted checkout for admin-confirmed customer orders

Next milestones should add broader automated tests and payment reconciliation tooling. KYC, contracts, and regulated investment transactions remain intentionally out of scope until legal requirements are confirmed.
