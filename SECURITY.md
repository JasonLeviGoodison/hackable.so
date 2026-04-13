# Security Policy

This repository is intentionally vulnerable by design. The listed lab vulnerabilities are part of the project and are not treated as routine security bugs.

In scope for responsible disclosure:

- Real credentials, API keys, database URLs, or cloud resources accidentally committed to the repo
- Vulnerabilities that let an attacker escape an intended single-tenant lab and impact the host, other tenants, or unrelated infrastructure
- Supply-chain or build issues that expose maintainer infrastructure or allow arbitrary code execution outside the intended lab
- Any accidental vulnerability that is not part of the documented challenge set and materially increases real-world blast radius

Out of scope:

- The intentional application-layer vulnerabilities documented in the README
- Findings that only affect a single throwaway local deployment using fake data

Reporting guidance:

- Do not open a public issue for accidental secret exposure or sandbox escape bugs
- Contact the maintainer privately through your forge's private security reporting flow or another private channel
- Include reproduction steps, impact, and any secrets or logs in redacted form only

Operational rule:

- This project must never be deployed with real user data, real credentials, or production-adjacent infrastructure
