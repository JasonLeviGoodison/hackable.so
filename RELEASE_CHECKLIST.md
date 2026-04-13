# Public Release Checklist

Use this checklist before publishing the repository or a hosted demo.

## Source Release

- Confirm there are no live credentials, service-role keys, database passwords, or private project URLs left in the working tree
- Confirm only `.env.example` files are tracked
- Confirm all sample credentials and tokens are obviously throwaway demo values
- Confirm seeded data is synthetic and not taken from real users, employers, or customers
- Confirm `LICENSE`, `NOTICE`, `SECURITY.md`, and `CONTRIBUTING.md` are present

## Deployment Boundary

- Do not market this as safe for a shared public multi-user instance
- Supported modes are local dev, one stack per user/team, or short-lived isolated lab environments
- Never connect it to production-adjacent cloud projects or real email domains
- Use a fresh throwaway Supabase project per deployment

## Git History

- If any live secrets were ever committed in this repository's history, do not publish that history
- Rotate or delete the affected cloud project before release
- Publish from a fresh sanitized repository or rewrite history before making the repo public

## Legal

- Apache-2.0 is real open source and limits maintainer liability
- Apache-2.0 allows commercial use; if you want to prohibit commercial use, you must switch to a non-OSI source-available license instead
- `TRADEMARKS.md` can restrict branding, but it does not prohibit selling forks or services built from the code
