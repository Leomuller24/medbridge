ALTER TABLE public.profiles
  ADD COLUMN interests text[] NOT NULL DEFAULT '{}',
  ADD COLUMN languages text[] NOT NULL DEFAULT '{}',
  ADD COLUMN onboarded boolean NOT NULL DEFAULT false,
  ADD COLUMN notify_email boolean NOT NULL DEFAULT true,
  ADD COLUMN notify_community boolean NOT NULL DEFAULT true;