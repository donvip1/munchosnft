# Munchos NFT

Munchos NFT is a mobile-first Web3 application for the Robinhood Chain ecosystem. Version 1 includes the whitelist/referral system and the completed Genesis testnet mint and Catalyst Fusion campaign. The public campaign is now time-gated, while evolution, staking, rewards, profiles, and marketplace modules remain staged as Coming Soon.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Wagmi + Viem
- TanStack Query
- Google Apps Script + Google Sheets backend

## Local Setup

```bash
npm install
npm run dev
npm test
```

Create `.env.local` from `.env.example`:

```bash
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
NEXT_PUBLIC_SITE_URL=https://www.munchosapp.xyz
NEXT_PUBLIC_PINNED_X_POST_URL=https://x.com/munchonft/status/2076633758585765988?s=20
NEXT_PUBLIC_GENESIS_CONTRACT_ADDRESS=0xf049D304746b5d05AC321B8c997BBe53CcDbf103
NEXT_PUBLIC_CATALYST_FUSION_CONTRACT_ADDRESS=0xed236b977e46Dc6360bfe72d231912eb63bAA27c
NEXT_PUBLIC_TESTNET_ENDS_AT=2026-07-29T08:00:00+01:00
```

If `GOOGLE_APPS_SCRIPT_URL` is not present in development, the API returns a demo success response so the UI can be tested. Production requires the Apps Script URL.

For Vercel, set `NEXT_PUBLIC_SITE_URL` to the active production URL. The current production domain is `https://www.munchosapp.xyz`.

The project X account is `@munchonft`. The pinned post task points to `https://x.com/munchonft/status/2076633758585765988?s=20`.

## Genesis Mint

The home-page mint console connects injected EVM wallets to Robinhood Chain Testnet (chain ID `46630`), reads the current Genesis sale state, checks whitelist eligibility through `/api/mint-proof`, and submits the phase-appropriate mint transaction.

Testnet token metadata is served from `/api/testnet-metadata/<tokenId>.json` for all
4,444 possible ids. It cycles the five IPFS-pinned concept artworks and is never
used for the future mainnet collection.

The public site currently exposes eligibility checks only. The on-chain sale
phase remains closed until the community testnet mint announcement.

The public Catalyst Fusion Lab is deployed at `/fusion` against
`0xed236b977e46Dc6360bfe72d231912eb63bAA27c`. It atomically consumes one
approved Genesis NFT and mints either Munchos OG with one virtual catalyst or
Munchos Legendary with both catalysts. Genesis metadata cycles Arts 1-3;
Arts 4 and 5 are reserved for the OG and Legendary result tiers.

The public testnet mint console is available at `/testnet-mint`. The campaign
uses the Genesis Public phase so all wallets share the same on-chain one-mint
allowance for that phase.

## Testnet Campaign Shutdown

The Robinhood Chain Testnet campaign closes at the exact instant below:

```text
2026-07-29T08:00:00+01:00
```

The application treats `now >= cutoff` as closed. Before the cutoff, `/testnet-mint`, `/fusion`, and `/testnet-guide` show a live countdown. At and after the cutoff, those routes replace their active interfaces with a **Testnet has ended** state, and the homepage stops advertising active testnet minting and fusion.

The mint, Genesis approval, and fusion transaction handlers also check the deadline immediately before starting the wallet transaction flow. This protects sessions that were opened before the cutoff. The website checks do not cancel transactions that were already signed and broadcast before the cutoff.

### Protocol-level shutdown

Website gating cannot prevent users from calling contracts directly through an explorer, script, wallet, or another application. To guarantee protocol-level closure, an authorized owner/operator must pause both deployed contracts on Robinhood Chain Testnet:

- Genesis (`MunchosGenesis`): `0xf049D304746b5d05AC321B8c997BBe53CcDbf103`
- Fusion (`MunchosCatalystFusion`): `0xed236b977e46Dc6360bfe72d231912eb63bAA27c`
- Verified owner of both at shutdown review: `0xDB62fD815dFE3398FCe799C6C74d618837891EbA`

Both contracts expose `pause()`, `unpause()`, `paused()`, `owner()`, `OPERATOR_ROLE()`, and `hasRole(bytes32,address)`. The owner address held `OPERATOR_ROLE` on both contracts during the shutdown review. Before sending transactions, confirm that the connected wallet is still authorized and that the addresses above match the intended deployments.

Recommended shutdown procedure:

1. Deploy this website revision with `NEXT_PUBLIC_TESTNET_ENDS_AT=2026-07-29T08:00:00+01:00` before the cutoff.
2. Connect the authorized owner/operator wallet to Robinhood Chain Testnet (chain ID `46630`).
3. Call `pause()` on the Genesis contract and wait for a successful receipt.
4. Call `pause()` on the Fusion contract and wait for a successful receipt.
5. Read `paused()` on both contracts and verify that each returns `true`.
6. Verify the deployed site shows the countdown before the cutoff and the ended state at or after it.
7. Attempt no destructive ownership or role changes as part of shutdown; pausing is sufficient and reversible through the authorized `unpause()` function if ever required.

The shutdown is not complete at protocol level until both `paused()` reads return `true`.

## Dependency Advisory

`npm audit` currently reports one underlying moderate PostCSS advisory twice
through Next.js. Next `15.5.20` and the latest stable Next `16.2.10` both pin
PostCSS `8.4.31`; npm offers only an invalid downgrade to Next 9. Recheck this
after each supported Next release and upgrade when Next ships PostCSS `>=8.5.10`.

`src/data/whitelist-proofs.json` contains hashed Merkle leaves and proofs generated by `munchos-protocol`; it does not contain the source CSV or raw wallet-address keys. Regenerate it whenever the protocol whitelist root changes.

## X Task Confirmation

The whitelist uses a guided confirmation flow because the X Free Developer Plan does not support reliable programmatic verification for follow, post, repost, and comment actions.

The app does not claim to verify X actions through the API. Instead, it asks users to:

- Follow `@munchonft`
- Make a public post about Munchos
- Paste the post link into the whitelist form
- Repost the pinned post
- Comment on the pinned post

After the first `Verify Tasks` action, the app shows a confirmation modal. The second `Verify Again` action completes the guided confirmation and submits the whitelist entry to Google Sheets.

## Collaboration Requests

The collaboration portal lives at `/collab` and submits through `/api/collab` using the same `GOOGLE_APPS_SCRIPT_URL` backend as the whitelist. Collaboration submissions are routed by `formType: "collaboration"` and stored in a separate Google Sheet named `Collaborations`.

Expected `Collaborations` columns:

- Timestamp
- Application ID
- Collaboration Type
- Project Name
- Contact Name
- Email
- Telegram
- X Username
- Discord
- Website
- Country
- Social Links
- Project Description
- Why Collaborate
- Extra Information
- Logo URL
- Status

Logo uploads accept PNG, SVG, or JPG files up to 5MB. The Apps Script stores uploaded logos in Google Drive and writes the file URL into the sheet when Drive permissions allow it.

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
