# Munchos NFT

Munchos NFT is a mobile-first Web3 waitlist application for the Robinhood Chain ecosystem. Version 1 ships the exclusive waitlist and referral system while keeping minting, fusion, evolution, staking, rewards, profiles, and marketplace modules visibly staged as Coming Soon.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Google Apps Script + Google Sheets backend

## Local Setup

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example`:

```bash
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
NEXT_PUBLIC_SITE_URL=https://munchosnft.vercel.app
NEXT_PUBLIC_PINNED_X_POST_URL=https://x.com/munchosnft/status/YOUR_PINNED_POST_ID
```

If `GOOGLE_APPS_SCRIPT_URL` is not present in development, the API returns a demo success response so the UI can be tested. Production requires the Apps Script URL.

For Vercel, set `NEXT_PUBLIC_SITE_URL` to the generated Vercel domain first. When `munchosnft.xyz` is connected later, update the same environment variable to `https://munchosnft.xyz` and redeploy.

## Google Sheets Backend

1. Create a Google Sheet.
2. Open Extensions > Apps Script.
3. Paste `scripts/google-apps-script/Code.gs`.
4. Deploy as a Web App.
5. Set access to allow requests from the deployed app.
6. Add the deployment URL to `GOOGLE_APPS_SCRIPT_URL`.
7. Optional: add a Script Property named `SITE_URL` with the active Vercel URL. Change it to `https://munchosnft.xyz` after the custom domain is live.

The backend stores timestamp, full name, email, X username, EVM wallet address, referral code, referrer, referral count, task completion, and submission status. It prevents duplicates by wallet address, email, and X username.

## Architecture

- `src/app`: App Router pages and API routes.
- `src/features`: Feature modules for home and waitlist surfaces.
- `src/components`: Shared layout and UI primitives.
- `src/lib`: Business logic, validation, referral helpers, and API clients.
- `src/config`: Product, roadmap, social, and feature configuration.
- `src/types`: Shared typed contracts.
