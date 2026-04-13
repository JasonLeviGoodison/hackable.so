# Contributing

Contributions are welcome, but this repository has stricter-than-normal safety rules because it is intentionally vulnerable software.

Before opening a PR:

- Keep all seeded data synthetic
- Do not commit real credentials, cloud project IDs, database URLs, or tokens
- Do not add integrations that require shared third-party infrastructure for the default setup
- Preserve the documented deployment boundary: local, single-tenant, or short-lived isolated lab only
- Update the README and release docs if you change the threat model or challenge set

Contribution rules:

- Mark intentional vulnerabilities clearly in code comments and docs
- Keep accidental maintainer risk low; the repo should be safe to clone and inspect publicly
- If you add a new challenge, prefer fake domains such as `.test` and obviously synthetic data
- If you remove or change a challenge, update the README

License:

- Unless stated otherwise, contributions are accepted under Apache-2.0
