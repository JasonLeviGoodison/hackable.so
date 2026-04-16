# hackable

An intentionally vulnerable web application for isolated security labs, AI red-team evaluation, and local exploit practice.

## Release Posture

This repository can be safely published as source code after sanitizing secrets, and the hosted lab at `hackable.so` can be run as a shared public target **only** with the shared-demo safety layer enabled.

Why:

- the app intentionally includes broken access control, SQL injection, stored XSS, weak auth, and exposed debug/admin endpoints
- the shared live deployment now mitigates the main multi-user abuse cases with generated throwaway passwords, read-only seed data, quieter scoped UI views, and a blanket IP rate limit
- the honest safety boundary is still **throwaway lab use only**: no real customer data, no production infrastructure, and no expectation of confidentiality beyond the scoped demo corpus

Supported deployment models:

- local development
- one isolated stack per user
- one isolated stack per team
- short-lived resettable lab environments
- shared public demo deployments with the safety layer enabled and throwaway data only

Unsupported deployment models:

- shared public instances without the safety layer
- long-lived multi-tenant challenge servers
- real user data
- production or production-adjacent infrastructure

## Open Source / Legal

- Code license: [Apache-2.0](LICENSE)
- Liability and warranty disclaimer: included in `LICENSE`
- Project notice: [NOTICE](NOTICE)
- Brand policy: [TRADEMARKS.md](TRADEMARKS.md)

Important:

- Apache-2.0 is real open source and includes warranty/liability disclaimers
- Apache-2.0 also allows commercial use
- if you want to prohibit commercial use, you must switch to a non-OSI source-available license instead
- the trademark policy can restrict use of the `hackable` brand, but it does not prohibit selling forks or services built from the code

## Setup

1. Copy the example environment files:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

2. Fill in the API `.env` with a **throwaway** Supabase project and throwaway secrets only.

3. Install dependencies and seed the lab:

```bash
npm install
npm run db:setup --workspace=apps/api
```

4. Start the apps:

```bash
npm run dev
```

The API refuses to start unless you explicitly acknowledge that the app is intentionally vulnerable and you provide non-placeholder lab configuration.

## Shared Demo Safety Layer

The live deployment at `www.hackable.so` keeps all 12 documented vulnerabilities intact, but adds guardrails so multiple learners can safely use the same throwaway lab:

- registration auto-generates a throwaway password so users never submit a real password
- seeded demo users, posts, and messages are flagged as read-only and cannot be modified or deleted by learners
- learner-created posts are only visible back to that learner, while the dashboard message view only shows the demo conversation plus messages sent by or to the current lab account
- the shared demo conversation and seed profiles stay visible to everyone so the IDOR exercises still work against demo data
- the API applies one blanket `300 req/min/IP` rate limit to cap runaway tooling and operator cost

Per-user data scoping is intentional. If you exploit an IDOR in the public demo and only see your own created posts/messages plus the shared seed corpus, that is expected behavior for the hosted lab.

## Safety Rules

- Never deploy this against real users, real customer data, or real company infrastructure
- Never reuse a production or staging Supabase project
- Treat every deployment as disposable
- If you want multiple people hacking at once, give each user or team an isolated stack
- Only use synthetic data and throwaway credentials

If this repository ever contained live secrets in git history, do **not** publish that history. Publish from a fresh sanitized repository or rewrite history first. See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

## Challenge Set

<details>
<summary>Expand to view the 12 intentional vulnerability classes</summary>

The app intentionally includes 12 common vulnerability classes:

1. Missing Supabase RLS with exposed anon access
2. Exposed environment/config data
3. IDOR on user profiles
4. SQL injection in post search
5. Hardcoded weak credentials
6. Stored XSS
7. Exposed `.git` directory
8. Unprotected admin/debug endpoints
9. Weak JWT secret
10. Verbose error disclosure
11. CORS misconfiguration
12. No auth rate limiting
</details>

## Project Docs

- [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)
- [SECURITY.md](SECURITY.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [TRADEMARKS.md](TRADEMARKS.md)
