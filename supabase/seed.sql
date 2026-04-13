-- TeamPulse Seed Data
-- Hackable Labs internal platform

-- ============================================================
-- PROFILES
-- ============================================================

-- Admin (VULN 5 - hardcoded creds: admin@hackable.test / password123)
INSERT INTO public.profiles (email, full_name, role, department, phone, ssn_last_four, salary, notes) VALUES
('admin@hackable.test', 'Sarah Chen', 'admin', 'Engineering', '(555) 100-0001', '4521', '$195,000', 'FLAG{idor_admin_data_exposed} - System administrator. Has access to all internal systems including AWS console, Stripe dashboard, and Supabase admin panel.');

-- Employees
INSERT INTO public.profiles (email, full_name, role, department, phone, ssn_last_four, salary, notes) VALUES
('marcus.johnson@hackable.test', 'Marcus Johnson', 'manager', 'Engineering', '(555) 100-0002', '8834', '$145,000', 'Engineering manager. Leads the platform team. Joined March 2021.'),
('priya.patel@hackable.test', 'Priya Patel', 'employee', 'Engineering', '(555) 100-0003', '2297', '$132,000', 'Senior backend engineer. Owns the auth service and payment integrations.'),
('james.oconnor@hackable.test', 'James O''Connor', 'employee', 'Sales', '(555) 100-0004', '6610', '$95,000', 'Account executive, enterprise segment. Exceeded Q1 quota by 18%.'),
('aisha.williams@hackable.test', 'Aisha Williams', 'manager', 'Marketing', '(555) 100-0005', '3378', '$125,000', 'Director of growth marketing. Previously at Datadog and Twilio.'),
('david.kim@hackable.test', 'David Kim', 'employee', 'Finance', '(555) 100-0006', '9142', '$110,000', 'Financial analyst. Manages the monthly burn-rate reporting and board deck financials.'),
('rachel.torres@hackable.test', 'Rachel Torres', 'employee', 'HR', '(555) 100-0007', '5563', '$88,000', 'HR generalist. Handles onboarding, benefits administration, and employee relations.'),
('alex.nakamura@hackable.test', 'Alex Nakamura', 'employee', 'Engineering', '(555) 100-0008', '7205', '$128,000', 'Frontend engineer. Building the new React dashboard. On-call this week.');

-- ============================================================
-- POSTS
-- ============================================================

INSERT INTO public.posts (author_id, title, content, category, created_at) VALUES
(2, 'Migrating to Next.js 14 — Timeline & Plan',
 'Hey team, wanted to share the migration plan for moving our customer portal from CRA to Next.js 14 with the App Router. We''re targeting completion by end of Q2. Key milestones:

Phase 1 (April): Set up new project scaffolding, migrate shared components
Phase 2 (May): Migrate page routes, integrate API layer
Phase 3 (June): Performance testing, gradual rollout behind feature flag

If you have concerns or dependencies, drop a comment or ping me on Slack. I''ll send calendar invites for the weekly sync starting next Monday.',
 'engineering', '2026-03-15 09:30:00+00'),

(1, 'Office Hours Changing Starting April 14',
 'Hi everyone — quick heads-up that starting April 14, our core office hours will shift to 10 AM – 4 PM to better align with our West Coast partners. Flex hours remain the same. Please update your calendars accordingly. If this creates any issues with client meetings, let your manager know by EOW.',
 'general', '2026-03-20 14:00:00+00'),

(5, 'Welcome Our New Marketing Coordinator!',
 'Excited to announce that <b>Jordan Lee</b> is joining the Growth Marketing team starting next Monday! Jordan comes to us from HubSpot where they spent 3 years on the content strategy team. Please give them a warm welcome and feel free to stop by their desk (4th floor, near the coffee bar) to say hi. <i>Welcome aboard, Jordan!</i>',
 'general', '2026-03-22 11:15:00+00'),

(3, 'Auth Service Maintenance Window — March 28',
 'We''ll be performing scheduled maintenance on the authentication service this Saturday (March 28) from 2:00 AM to 4:00 AM UTC. During this window:

- SSO logins may experience up to 30 seconds of latency
- Password resets will be temporarily unavailable
- Active sessions will NOT be affected

No action needed from most teams. If you have batch jobs that depend on the auth API, please reschedule them outside this window. Reach out to #platform-eng with questions.',
 'engineering', '2026-03-25 16:45:00+00'),

(2, 'Q1 Sprint Retrospective Summary',
 'Thanks to everyone who joined the Q1 retro on Friday. Here''s a quick recap of what came up:

What went well: Shipped the new onboarding flow 2 weeks early, reduced P1 incident count by 40%, strong cross-team collaboration on the billing migration.

What needs improvement: Too many context switches mid-sprint, documentation still lagging behind feature releases, some flaky integration tests causing CI delays.

Action items: Marcus to propose a "focus Friday" policy, Priya to lead a docs sprint in April, Alex to audit and fix the top 10 flakiest tests.

Full notes in Confluence — search for "Q1 2026 Retro."',
 'engineering', '2026-04-01 10:00:00+00'),

(4, 'New Enterprise Lead — GlobalTech Industries',
 'Just got off a great discovery call with GlobalTech Industries (Fortune 500, ~12,000 employees). They''re evaluating us for their internal comms platform replacement. Key details:

- Current vendor: legacy SharePoint deployment
- Timeline: Decision by end of Q2, rollout Q3
- Champion: VP of Internal Communications (Dana Morrison)
- Estimated deal size: $180K ARR

I''ll be putting together a custom demo for next week. If anyone from Engineering can join to answer technical questions about our API and SSO integration, that would be huge. Ping me on Slack.',
 'sales', '2026-04-02 13:20:00+00'),

(6, 'Monthly Budget Review — March 2026',
 'March financials are in. Quick highlights:

- Total burn: $412K (under budget by $23K)
- Revenue: $289K MRR (up 6.2% MoM)
- Runway: 18.4 months at current burn
- Notable line items: AWS costs up 12% due to the data migration, will normalize in April

Full breakdown will be in the board deck I''m circulating Thursday. Managers — please submit any expense recharges by EOD Wednesday.',
 'finance', '2026-04-03 09:00:00+00'),

(7, 'Benefits Enrollment Reminder — Deadline April 18',
 'Friendly reminder that open enrollment for Q2 benefits changes closes on April 18. This includes:

- Health plan tier changes (we added a new HSA-compatible option)
- Dental/vision enrollment
- FSA contribution adjustments
- Commuter benefits

Log into Rippling to review your current elections and make changes. If you have questions, I have office hours Tuesday and Thursday 2-3 PM, or email me directly.',
 'general', '2026-04-04 08:30:00+00'),

(8, 'Frontend Performance Wins — Dashboard Load Time Down 40%',
 'Wanted to share some good news from the frontend side. After the optimization sprint last week, our main dashboard load time dropped from ~3.2s to ~1.9s on median. Here''s what moved the needle:

1. Lazy-loaded the analytics charts (saved ~600ms)
2. Switched to Server Components for the sidebar nav
3. Implemented proper image optimization with next/image
4. Reduced our JS bundle by 180KB after tree-shaking unused lodash methods

Next up: tackling the search page, which is still pretty sluggish on large datasets. Props to Priya for the backend query optimizations that made the API response times possible.',
 'engineering', '2026-04-07 11:00:00+00'),

(1, 'All-Hands Meeting — Thursday April 9 at 3 PM',
 'Reminder: our monthly all-hands is this Thursday at 3 PM in the main conference room (and Zoom for remote folks). Agenda:

1. Q1 revenue update (David)
2. Product roadmap preview (Sarah)
3. New hire introductions
4. Open Q&A

Please submit questions in advance via the #all-hands Slack channel. Recording will be posted to Confluence afterward as usual.',
 'general', '2026-04-07 15:00:00+00'),

(3, 'API Rate Limiting Changes — Heads Up for Integration Partners',
 'Starting April 21, we''re rolling out updated rate limits on our public API:

- Free tier: 100 requests/minute (was 200)
- Pro tier: 1,000 requests/minute (unchanged)
- Enterprise: custom (unchanged)

This is to address some abuse we''ve been seeing from a handful of free-tier accounts hammering the search endpoint. If any of your integration partners will be affected, please give them a heads-up. Full docs update will go out next week.',
 'engineering', '2026-04-08 14:30:00+00'),

(5, 'Content Calendar — April 2026',
 'April content calendar is finalized. Key campaigns:

- Blog series: "Building Internal Culture at Scale" (4 posts, weekly)
- Case study: GlobalTech early access program (pending legal review)
- Webinar: "Modern Internal Comms for Distributed Teams" — April 24
- Social push around our SOC 2 Type II completion

Writers: please have first drafts in by the dates marked in Asana. Design requests should go to #creative with at least 5 business days lead time.',
 'marketing', '2026-04-09 10:00:00+00'),

(2, 'CI/CD Pipeline Improvements',
 'Pushed some updates to our CI pipeline over the weekend:

- Build times reduced from ~8 min to ~4.5 min by parallelizing test suites
- Added automated lighthouse scoring on preview deploys
- Implemented branch-based preview environments (finally!)
- Fixed the flaky Playwright tests Alex identified in the retro

The branch preview feature means every PR now gets its own URL at preview-{branch}.nexusdynamics.dev. This should make QA reviews much smoother. Let me know if you hit any issues.',
 'engineering', '2026-04-10 09:15:00+00');

-- ============================================================
-- MESSAGES
-- ============================================================

INSERT INTO public.messages (sender_id, recipient_id, content, created_at) VALUES
(2, 1, 'Hey Sarah, the Next.js migration is on track but I might need to pull Alex off the dashboard optimization to help with the routing layer. Can we sync tomorrow?', '2026-04-01 10:30:00+00'),
(1, 2, 'Sure, let''s do 11 AM. I also want to discuss the new hire req for the platform team — got budget approval yesterday.', '2026-04-01 10:45:00+00'),
(4, 5, 'Aisha, the GlobalTech demo is next Wednesday. Can your team put together a one-pager on our enterprise features? They''re specifically interested in the SSO and audit log capabilities.', '2026-04-03 14:00:00+00'),
(5, 4, 'On it — I''ll have the collateral ready by Monday. Can you share the discovery call notes so I can tailor the messaging?', '2026-04-03 14:20:00+00'),
(7, 1, 'Sarah, just a heads-up: we''re getting close to the open enrollment deadline and only 60% of employees have reviewed their elections. Mind sending a reminder at the all-hands?', '2026-04-07 09:00:00+00'),
(1, 7, 'Good call, I''ll mention it Thursday. Can you also send a Slack reminder to anyone who hasn''t logged into Rippling yet?', '2026-04-07 09:15:00+00'),
(3, 8, 'Nice work on the dashboard perf improvements! The backend query caching I pushed last week should help even more once you wire up the new endpoints. Want to pair on it Friday?', '2026-04-07 16:00:00+00'),
(8, 3, 'Absolutely, let''s do it. I''ll block off 2-4 PM. Also — have you seen the search page latency? It''s brutal on large result sets. Might need your help optimizing that query.', '2026-04-07 16:30:00+00');

-- ============================================================
-- SECRETS / FLAGS
-- ============================================================

INSERT INTO public.secrets (key, value, description) VALUES
('FLAG_RLS_BYPASS', 'FLAG{supabase_rls_not_enabled_data_exposed}', 'Main RLS bypass flag'),
('FLAG_SQL_INJECTION', 'FLAG{sql_injection_data_exfiltrated}', 'SQL injection flag'),
('FLAG_GIT_EXPOSED', 'FLAG{git_directory_exposed_source_leaked}', 'Git directory exposure flag'),
('AWS_ACCESS_KEY_ID', 'AKIAIOSFODNN7EXAMPLE', 'AWS access key (fake)'),
('AWS_SECRET_ACCESS_KEY', 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', 'AWS secret key (fake)'),
('STRIPE_SECRET_KEY', 'sk_live_51234567890abcdefghijklmnop', 'Stripe secret key (fake)'),
('INTERNAL_API_TOKEN', 'hackable-internal-demo-token', 'Internal service token'),
('DATABASE_BACKUP_KEY', 'backup-key-nd-2024-AzK8mN3pQ', 'Database backup encryption key');
