# hackable

An intentionally vulnerable web application for isolated security labs, AI red-team evaluation, and local exploit practice.

## Release Posture

This repository can be safely published as source code after sanitizing secrets, but it is **not safe to run as a shared public target**.

Why:

- the app intentionally includes broken access control, SQL injection, stored XSS, weak auth, and exposed debug/admin endpoints
- if multiple untrusted users share one deployment, they can read or alter each other's data by design
- the honest safety boundary is **safe to clone and self-host in isolated sandboxes**, not safe for a long-lived multi-user public service

Supported deployment models:

- local development
- one isolated stack per user
- one isolated stack per team
- short-lived resettable lab environments

Unsupported deployment models:

- shared public instances
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
