A web app for parents of children aged 5–8 who are learning to read. Every evening the child reads a short text aloud (from paper or the screen), the parent taps the words the child misses and picks what the child said. Readly works out which reading skill is weak and gives the parent a plan for tomorrow: what to practise, what to say, and a practice story in which every word is checked by code.

No microphone, no iPad, no sign-up. Child data stays in the browser (localStorage); signing in with an emailed link is optional and only syncs it across devices.

## What the code does and what the LLM does

| Step | Who | Where |
|---|---|---|
| Splitting each word into letter-sound chunks over CMUdict (sh, ai, ar, silent e…) and tagging its skills | **Code** | `lib/engine/phonics.ts` |
| Offering likely misreadings ("bike" → bik, bake, bite) | **Code**: skill rules applied in reverse | `lib/engine/distractors.ts`, `variants.ts` |
| Deciding which skill explains a miss | **Code**: priority rules (ТЗ §5.4) | `lib/engine/classify.ts` |
| Mastery, weak spot, focus for tomorrow | **Code**: decayed error rate `(errors+1)/(attempts+2)` | `lib/engine/mastery.ts` |
| Tomorrow's plan: word pairs, word list, "Say this" scripts | **Code** + hand-written content | `lib/engine/plan.ts`, `skills.ts` |
| Practice story text | **LLM** (Claude Sonnet 5.5, Haiku 5.5 if slow) | `lib/server/claude.ts` |
| Checking every story word is readable for this child | **Code**: validator, 2 retries, then a ready-made story | `lib/engine/validate.ts`, `lib/server/story-service.ts` |

The LLM never decides anything about the child. If it is slow, refuses or writes a word the child can't decode yet, the parent gets a hand-written library story that passed the same validator.

## Architecture

```
lib/engine/   domain core: pure TypeScript, no I/O. Runs in the browser and on the server
lib/server/   server-only services; `import "server-only"`:
                story-service + claude (LLM → validator → library fallback), lexicon-full (CMUdict),
                stripe + subscription (checkout, plan lookup by email),
                db (node:sqlite) + auth (magic-link tokens, sessions, synced state), session (cookies), mailer (Resend)
lib/client/   browser-only: store (localStorage behind a Repository interface), account (sign-in state and sync),
                merge (local ↔ account merge), api (typed fetch wrappers)
lib/safe-next.ts   post-sign-in redirect check, shared by server and browser
app/api/      thin route handlers: validate input (zod) → call a service → JSON
app/, components/   UI by screen; components/kit holds the shared primitives. Logic comes from lib/
data/         word bank, Dolch list, CMUdict, generated client lexicon
```

The core loop (check → classify → profile → plan) runs in the browser. The server is used only for what needs secrets or heavy data: Stripe Checkout, Claude, accounts, and the full 135k-word CMUdict for validating LLM stories. The browser gets a 1.4k-word lexicon (`data/lexicon-core.json`, ~30 KB) built by `npm run lexicon`.

Accounts are optional. `/api/auth/request` emails a one-time link (20 minutes, 5 per email per 15 minutes; only the SHA-256 of each token is stored), `/auth/verify` turns it into an httpOnly session cookie, and `lib/client/account.ts` merges the browser's state with `/api/state` and pushes changes back. A paid plan is looked up in Stripe by the signed-in email.

## Run

```bash
cp .env.example .env.local   # add STRIPE_SECRET_KEY (test mode) and ANTHROPIC_API_KEY
npm install
npm run dev                  # http://localhost:3000
npm test                     # unit tests (vitest)
npm run lexicon              # rebuild data/lexicon-core.json after editing words or stories
```

Both keys are optional for local development: without `ANTHROPIC_API_KEY` stories come from the library, and without `STRIPE_SECRET_KEY` the paywall shows a friendly error. Without `RESEND_API_KEY` the sign-in link is printed to the server log and shown on the page (development only). `SITE_URL` is the public origin used in sign-in and checkout links; set it in production. `DATABASE_PATH` defaults to `var/readly.db`.

Test payment: card `4242 4242 4242 4242`, any future date, any CVC.

## Deploy

Production: https://readly.13lab.tech (server `lab`, user `deploy`, `/home/deploy/readly`).

- Every push to `main` runs `.github/workflows/deploy.yml` on a self-hosted GitHub Actions runner on the server (`lab-readly`, label `readly`). It builds the Docker image (lint, typecheck and tests run inside the build), starts it with `docker compose` on `127.0.0.1:3030` and waits for `/api/health`. A failing commit is not deployed.
- The runner never runs pull requests: the workflow triggers only on `push` to `main` and manual dispatch, and workflows from outside contributors need approval.
- nginx terminates HTTPS (Let's Encrypt via certbot) and proxies to the container: `deploy/nginx.conf`. The old domain https://reading.13lab.tech permanently redirects (301) to the same path on readly.13lab.tech.
- Runtime secrets live only on the server in `/home/deploy/readly/.env` (`STRIPE_SECRET_KEY`, `ANTHROPIC_API_KEY`, `SITE_URL`).

```bash
gh workflow run deploy.yml                       # redeploy main
./deploy/build-on-server.sh                      # manual deploy of local HEAD, without Actions
```

## Tests

`tests/engine/` covers the control set from the spec (10/10 typical misreadings classified correctly), distractor/classifier consistency, mastery and focus selection, plan building, the story validator, every library story, and the LLM → validator → retry → library pipeline (with a stub writer).

`tests/server/` covers magic-link tokens (single use, expiry, rate limit), safe redirects, sessions, checkout claims and stored state against an in-memory SQLite database, plus plan detection from Stripe subscriptions. `tests/client/` covers the local ↔ account merge, localStorage parsing and the calendar reminder file.

## Data sources and licences

- **CMUdict 0.7b** (Carnegie Mellon University), BSD-style licence, commercial use allowed: `data/raw/cmudict.dict`.
- **Dolch sight words** (220 service words, published 1936/1948): treated as public domain. To be re-checked before release.
- **K–2 word bank, passages, stories, scripts**: written for Readly (`data/wordbank.ts`, `lib/engine/content.ts`, `lib/engine/skills.ts`).
- **Andika** font (SIL), SIL Open Font License.
- Not used (non-commercial licences): UFLI, CKLA, Open Source Phonics.

Readly is a coaching tool, not a medical or dyslexia diagnosis.
