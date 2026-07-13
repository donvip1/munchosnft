# Munchos NFT

Munchos NFT is a mobile-first Web3 whitelist application for the Robinhood Chain ecosystem. Version 1 ships the exclusive whitelist and referral system while keeping minting, fusion, evolution, staking, rewards, profiles, and marketplace modules visibly staged as Coming Soon.

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
NEXT_PUBLIC_SITE_URL=https://www.munchosapp.xyz
NEXT_PUBLIC_PINNED_X_POST_URL=https://x.com/munchonft/status/2076633758585765988?s=20
```

If `GOOGLE_APPS_SCRIPT_URL` is not present in development, the API returns a demo success response so the UI can be tested. Production requires the Apps Script URL.

For Vercel, set `NEXT_PUBLIC_SITE_URL` to the active production URL. The current production domain is `https://www.munchosapp.xyz`.

The project X account is `@munchonft`. The pinned post task points to `https://x.com/munchonft/status/2076633758585765988?s=20`.

## X Task Confirmation

The whitelist uses a guided confirmation flow because the X Free Developer Plan does not support reliable programmatic verification for follow, post, repost, and comment actions.

The app does not claim to verify X actions through the API. Instead, it asks users to:

- Follow `@munchonft`
- Make a public post about Munchos
- Paste the post link into the whitelist form
- Repost the pinned post
- Comment on the pinned post

After the first `Verify Tasks` action, the app shows a confirmation modal. The second `Verify Again` action completes the guided confirmation and submits the whitelist entry to Google Sheets.

## Google Sheets Backend

1. Create a Google Sheet.
2. Open Extensions > Apps Script.
3. Paste `scripts/google-apps-script/Code.gs`.
4. Deploy as a Web App.
5. Set access to allow requests from the deployed app.
6. Add the deployment URL to `GOOGLE_APPS_SCRIPT_URL`.
7. Optional: add a Script Property named `SITE_URL` with the active production URL: `https://www.munchosapp.xyz`.

The backend stores timestamp, full name, email, X username, Munchos X post link, EVM wallet address, referral code, referrer, referral count, task completion, and submission status. It prevents duplicates by wallet address, email, and X username.

The current backend script also stores the user's Munchos X post link. If your Apps Script was deployed before that field existed, paste the latest `scripts/google-apps-script/Code.gs` into Apps Script and redeploy the Web App.

## Vercel Deployment

1. Import `https://github.com/donvip1/munchosnft` into Vercel.
2. Keep the framework preset as Next.js.
3. Add the environment variables from `.env.example`.
4. Deploy from the `main` branch.
5. Add `www.munchosapp.xyz` as the production domain in Vercel.
6. Update `NEXT_PUBLIC_SITE_URL` in Vercel to `https://www.munchosapp.xyz`.
7. Update the Google Apps Script `SITE_URL` script property to `https://www.munchosapp.xyz`.
8. Redeploy after any environment variable change.

If you temporarily use the generated Vercel URL before DNS finishes, set `NEXT_PUBLIC_SITE_URL` and the Apps Script `SITE_URL` property to that temporary URL, then change both to `https://www.munchosapp.xyz` after the custom domain is active.

## Architecture

- `src/app`: App Router pages and API routes.
- `src/features`: Feature modules for home and whitelist surfaces.
- `src/components`: Shared layout and UI primitives.
- `src/lib`: Business logic, validation, referral helpers, and API clients.
- `src/config`: Product, roadmap, social, and feature configuration.
- `src/types`: Shared typed contracts.
