ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_seed BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS is_seed BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS is_seed BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE public.profiles
SET is_seed = TRUE
WHERE email IN (
  'admin@hackable.test',
  'marcus.johnson@hackable.test',
  'priya.patel@hackable.test',
  'james.oconnor@hackable.test',
  'aisha.williams@hackable.test',
  'david.kim@hackable.test',
  'rachel.torres@hackable.test',
  'alex.nakamura@hackable.test'
);

UPDATE public.posts
SET is_seed = TRUE
WHERE
  (author_id = 2 AND title = 'Migrating to Next.js 14 — Timeline & Plan' AND created_at = '2026-03-15 09:30:00+00') OR
  (author_id = 1 AND title = 'Office Hours Changing Starting April 14' AND created_at = '2026-03-20 14:00:00+00') OR
  (author_id = 5 AND title = 'Welcome Our New Marketing Coordinator!' AND created_at = '2026-03-22 11:15:00+00') OR
  (author_id = 3 AND title = 'Auth Service Maintenance Window — March 28' AND created_at = '2026-03-25 16:45:00+00') OR
  (author_id = 2 AND title = 'Q1 Sprint Retrospective Summary' AND created_at = '2026-04-01 10:00:00+00') OR
  (author_id = 4 AND title = 'New Enterprise Lead — GlobalTech Industries' AND created_at = '2026-04-02 13:20:00+00') OR
  (author_id = 6 AND title = 'Monthly Budget Review — March 2026' AND created_at = '2026-04-03 09:00:00+00') OR
  (author_id = 7 AND title = 'Benefits Enrollment Reminder — Deadline April 18' AND created_at = '2026-04-04 08:30:00+00') OR
  (author_id = 8 AND title = 'Frontend Performance Wins — Dashboard Load Time Down 40%' AND created_at = '2026-04-07 11:00:00+00') OR
  (author_id = 1 AND title = 'All-Hands Meeting — Thursday April 9 at 3 PM' AND created_at = '2026-04-07 15:00:00+00') OR
  (author_id = 3 AND title = 'API Rate Limiting Changes — Heads Up for Integration Partners' AND created_at = '2026-04-08 14:30:00+00') OR
  (author_id = 5 AND title = 'Content Calendar — April 2026' AND created_at = '2026-04-09 10:00:00+00') OR
  (author_id = 2 AND title = 'CI/CD Pipeline Improvements' AND created_at = '2026-04-10 09:15:00+00');

UPDATE public.messages
SET is_seed = TRUE
WHERE
  (sender_id = 2 AND recipient_id = 1 AND created_at = '2026-04-01 10:30:00+00' AND content = 'Hey Sarah, the Next.js migration is on track but I might need to pull Alex off the dashboard optimization to help with the routing layer. Can we sync tomorrow?') OR
  (sender_id = 1 AND recipient_id = 2 AND created_at = '2026-04-01 10:45:00+00' AND content = 'Sure, let''s do 11 AM. I also want to discuss the new hire req for the platform team — got budget approval yesterday.') OR
  (sender_id = 4 AND recipient_id = 5 AND created_at = '2026-04-03 14:00:00+00' AND content = 'Aisha, the GlobalTech demo is next Wednesday. Can your team put together a one-pager on our enterprise features? They''re specifically interested in the SSO and audit log capabilities.') OR
  (sender_id = 5 AND recipient_id = 4 AND created_at = '2026-04-03 14:20:00+00' AND content = 'On it — I''ll have the collateral ready by Monday. Can you share the discovery call notes so I can tailor the messaging?') OR
  (sender_id = 7 AND recipient_id = 1 AND created_at = '2026-04-07 09:00:00+00' AND content = 'Sarah, just a heads-up: we''re getting close to the open enrollment deadline and only 60% of employees have reviewed their elections. Mind sending a reminder at the all-hands?') OR
  (sender_id = 1 AND recipient_id = 7 AND created_at = '2026-04-07 09:15:00+00' AND content = 'Good call, I''ll mention it Thursday. Can you also send a Slack reminder to anyone who hasn''t logged into Rippling yet?') OR
  (sender_id = 3 AND recipient_id = 8 AND created_at = '2026-04-07 16:00:00+00' AND content = 'Nice work on the dashboard perf improvements! The backend query caching I pushed last week should help even more once you wire up the new endpoints. Want to pair on it Friday?') OR
  (sender_id = 8 AND recipient_id = 3 AND created_at = '2026-04-07 16:30:00+00' AND content = 'Absolutely, let''s do it. I''ll block off 2-4 PM. Also — have you seen the search page latency? It''s brutal on large result sets. Might need your help optimizing that query.');

CREATE INDEX IF NOT EXISTS idx_profiles_is_seed ON public.profiles (is_seed);
CREATE INDEX IF NOT EXISTS idx_posts_is_seed ON public.posts (is_seed);
CREATE INDEX IF NOT EXISTS idx_messages_is_seed ON public.messages (is_seed);
