# VOGUE FAST | منصة توصيل الأزياء السريعة

Unified single-deployment platform for fast fashion delivery, merchant POS, fleet dispatch, and financial vault management.

## Unified Application Routes (Single Domain)

All portals are hosted inside one consolidated Vercel project (`vogue-fast`) under a single shared domain (`https://vogue-fast.vercel.app`):

- `/store` — Customer storefront
- `/vendor` — Merchant POS portal (requires Vendor authentication)
- `/driver` — Driver application (requires Driver authentication)
- `/admin` — Super Admin financial vault & dashboard (requires Super Admin authentication)
- `/join` — Partner onboarding hub
- `/join/vendor` — Merchant registration
- `/join/driver` — Driver registration

## Authentication & Role-Based Authorization

Server-side authentication and role-based session verification are enforced via `/api/auth` using HMAC-SHA256 signed `HttpOnly` session cookies (`vf_token_admin`, `vf_token_vendor`, `vf_token_driver`, `vf_token_customer`).

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
