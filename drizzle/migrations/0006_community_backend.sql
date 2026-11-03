-- Helpers
CREATE OR REPLACE FUNCTION public.is_provider(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND account_role = 'provider')
$$;
CREATE OR REPLACE FUNCTION public.is_community_moderator(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'moderator') OR public.has_role(_user_id, 'admin')
$$;

-- Tables
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  category text NOT NULL DEFAULT 'Communication' CHECK (char_length(category) <= 60),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  language text NOT NULL DEFAULT '' CHECK (char_length(language) <= 60),
  source text CHECK (source IS NULL OR char_length(source) <= 500),
  status text NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','reported','hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.community_posts (created_at DESC);
CREATE INDEX ON public.community_posts (author_id);

CREATE TABLE public.community_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.community_answers(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  source text CHECK (source IS NULL OR char_length(source) <= 500),
  status text NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','reported','hidden')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.community_answers (post_id);
CREATE INDEX ON public.community_answers (author_id);

CREATE TABLE public.community_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid NOT NULL,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  answer_id uuid REFERENCES public.community_answers(id) ON DELETE CASCADE,
  counts boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((post_id IS NULL) <> (answer_id IS NULL)),
  UNIQUE (voter_id, post_id),
  UNIQUE (voter_id, answer_id)
);
CREATE INDEX ON public.community_votes (voter_id, created_at);

CREATE TABLE public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  answer_id uuid REFERENCES public.community_answers(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('Misinformation','Personal information','Spam or advertising','Disrespectful','Other')),
  detail text CHECK (detail IS NULL OR char_length(detail) <= 300),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((post_id IS NULL) <> (answer_id IS NULL)),
  UNIQUE (reporter_id, post_id),
  UNIQUE (reporter_id, answer_id)
);

CREATE TABLE public.community_mod_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_kind text NOT NULL CHECK (item_kind IN ('post','comment')),
  item_id uuid NOT NULL,
  author_id uuid,
  excerpt text NOT NULL DEFAULT '',
  decision text NOT NULL CHECK (decision IN ('remove','restore')),
  reason text NOT NULL DEFAULT '',
  decided_by text NOT NULL DEFAULT 'ai',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.community_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_id uuid,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts, public.community_answers TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.community_votes, public.community_reports TO authenticated;
GRANT SELECT, INSERT ON public.community_warnings TO authenticated;
GRANT SELECT ON public.community_mod_log TO authenticated;
GRANT ALL ON public.community_posts, public.community_answers, public.community_votes, public.community_reports, public.community_mod_log, public.community_warnings TO service_role;

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_mod_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_warnings ENABLE ROW LEVEL SECURITY;

-- Posts & answers policies
CREATE POLICY "Providers read visible posts" ON public.community_posts FOR SELECT TO authenticated
  USING (public.is_provider(auth.uid()) AND (status <> 'hidden' OR author_id = auth.uid() OR public.is_community_moderator(auth.uid())));
CREATE POLICY "Providers create own posts" ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND public.is_provider(auth.uid()) AND status = 'visible');
CREATE POLICY "Edit own posts" ON public.community_posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid() AND public.is_provider(auth.uid())) WITH CHECK (author_id = auth.uid());
CREATE POLICY "Moderators update posts" ON public.community_posts FOR UPDATE TO authenticated
  USING (public.is_community_moderator(auth.uid())) WITH CHECK (public.is_community_moderator(auth.uid()));
CREATE POLICY "Delete own posts" ON public.community_posts FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_community_moderator(auth.uid()));

CREATE POLICY "Providers read visible answers" ON public.community_answers FOR SELECT TO authenticated
  USING (public.is_provider(auth.uid()) AND (status <> 'hidden' OR author_id = auth.uid() OR public.is_community_moderator(auth.uid())));
CREATE POLICY "Providers create own answers" ON public.community_answers FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND public.is_provider(auth.uid()) AND status = 'visible');
CREATE POLICY "Edit own answers" ON public.community_answers FOR UPDATE TO authenticated
  USING (author_id = auth.uid() AND public.is_provider(auth.uid())) WITH CHECK (author_id = auth.uid());
CREATE POLICY "Moderators update answers" ON public.community_answers FOR UPDATE TO authenticated
  USING (public.is_community_moderator(auth.uid())) WITH CHECK (public.is_community_moderator(auth.uid()));
CREATE POLICY "Delete own answers" ON public.community_answers FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.is_community_moderator(auth.uid()));

-- Votes: providers see counts; create/remove only their own
CREATE POLICY "Providers read votes" ON public.community_votes FOR SELECT TO authenticated USING (public.is_provider(auth.uid()));
CREATE POLICY "Vote as yourself" ON public.community_votes FOR INSERT TO authenticated
  WITH CHECK (voter_id = auth.uid() AND public.is_provider(auth.uid()));
CREATE POLICY "Remove own vote" ON public.community_votes FOR DELETE TO authenticated USING (voter_id = auth.uid());

-- Reports: reporters see their own, moderators see all
CREATE POLICY "Read own or moderate reports" ON public.community_reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.is_community_moderator(auth.uid()));
CREATE POLICY "Report as yourself" ON public.community_reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid() AND public.is_provider(auth.uid()));
CREATE POLICY "Moderators clear reports" ON public.community_reports FOR DELETE TO authenticated
  USING (public.is_community_moderator(auth.uid()));

CREATE POLICY "Moderators read log" ON public.community_mod_log FOR SELECT TO authenticated USING (public.is_community_moderator(auth.uid()));

CREATE POLICY "Read own or moderate warnings" ON public.community_warnings FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_community_moderator(auth.uid()));
CREATE POLICY "Moderators warn" ON public.community_warnings FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND public.is_community_moderator(auth.uid()));

-- Guard: authorship is fixed; only moderators (or the report system) change status
CREATE OR REPLACE FUNCTION public.community_guard_update() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.author_id <> OLD.author_id OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Author and creation time cannot be changed.';
  END IF;
  IF TG_TABLE_NAME = 'community_answers' AND (NEW.post_id <> OLD.post_id OR NEW.parent_id IS DISTINCT FROM OLD.parent_id) THEN
    RAISE EXCEPTION 'An answer cannot be moved.';
  END IF;
  IF NEW.status <> OLD.status AND coalesce(current_setting('community.system', true), '') <> 'on'
     AND auth.uid() IS NOT NULL AND NOT public.is_community_moderator(auth.uid()) THEN
    RAISE EXCEPTION 'Only moderators can change the status of content.';
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER community_posts_guard BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.community_guard_update();
CREATE TRIGGER community_answers_guard BEFORE UPDATE ON public.community_answers FOR EACH ROW EXECUTE FUNCTION public.community_guard_update();

-- Posting rules: verified accounts; new accounts (<7 days) limited to 3 posts / 10 answers per day and no links in posts
CREATE OR REPLACE FUNCTION public.community_check_posting() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE u record; n int; txt text;
BEGIN
  SELECT created_at, email_confirmed_at, raw_app_meta_data INTO u FROM auth.users WHERE id = NEW.author_id;
  IF u IS NULL OR NOT (u.email_confirmed_at IS NOT NULL OR coalesce(u.raw_app_meta_data->'providers', '[]'::jsonb) ? 'google' OR u.raw_app_meta_data->>'provider' = 'google') THEN
    RAISE EXCEPTION 'Please verify your account (confirm your email or sign in with Google) before posting or commenting.';
  END IF;
  IF u.created_at > now() - interval '7 days' THEN
    IF TG_TABLE_NAME = 'community_posts' THEN
      SELECT count(*) INTO n FROM public.community_posts WHERE author_id = NEW.author_id AND created_at > now() - interval '1 day';
      IF n >= 3 THEN RAISE EXCEPTION 'New accounts can share up to 3 posts per day. Please try again tomorrow.'; END IF;
      txt := NEW.title || ' ' || NEW.body || ' ' || coalesce(NEW.source, '');
      IF txt ~* '(https?://|www\.|\m[a-z0-9-]+\.(com|ch|org|net|io|de|fr|info|ly|me|co)\M)' THEN
        RAISE EXCEPTION 'Links in posts are allowed after your first 7 days.';
      END IF;
    ELSE
      SELECT count(*) INTO n FROM public.community_answers WHERE author_id = NEW.author_id AND created_at > now() - interval '1 day';
      IF n >= 10 THEN RAISE EXCEPTION 'New accounts can write up to 10 comments per day. Please try again tomorrow.'; END IF;
    END IF;
  END IF;
  NEW.created_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER community_posts_rules BEFORE INSERT ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.community_check_posting();
CREATE TRIGGER community_answers_rules BEFORE INSERT ON public.community_answers FOR EACH ROW EXECUTE FUNCTION public.community_check_posting();

-- Vote rules: no self-votes, 10 per day, votes from accounts under 7 days are stored but never count
CREATE OR REPLACE FUNCTION public.community_check_vote() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE target_author uuid; n int; voter_created timestamptz;
BEGIN
  IF NEW.post_id IS NOT NULL THEN SELECT author_id INTO target_author FROM public.community_posts WHERE id = NEW.post_id;
  ELSE SELECT author_id INTO target_author FROM public.community_answers WHERE id = NEW.answer_id; END IF;
  IF target_author IS NULL THEN RAISE EXCEPTION 'This item no longer exists.'; END IF;
  IF target_author = NEW.voter_id THEN RAISE EXCEPTION 'You can''t mark your own content as helpful.'; END IF;
  SELECT count(*) INTO n FROM public.community_votes WHERE voter_id = NEW.voter_id AND created_at > now() - interval '1 day';
  IF n >= 10 THEN RAISE EXCEPTION 'You can give up to 10 helpful votes per day.'; END IF;
  SELECT created_at INTO voter_created FROM auth.users WHERE id = NEW.voter_id;
  NEW.counts := voter_created IS NOT NULL AND voter_created <= now() - interval '7 days';
  NEW.created_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER community_votes_rules BEFORE INSERT ON public.community_votes FOR EACH ROW EXECUTE FUNCTION public.community_check_vote();

-- Reports: 1+ report marks content reported, 3 hides it
CREATE OR REPLACE FUNCTION public.community_apply_report() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n int; st text;
BEGIN
  PERFORM set_config('community.system', 'on', true);
  IF NEW.post_id IS NOT NULL THEN
    SELECT count(*) INTO n FROM public.community_reports WHERE post_id = NEW.post_id;
    st := CASE WHEN n >= 3 THEN 'hidden' ELSE 'reported' END;
    UPDATE public.community_posts SET status = st WHERE id = NEW.post_id AND status <> 'hidden';
  ELSE
    SELECT count(*) INTO n FROM public.community_reports WHERE answer_id = NEW.answer_id;
    st := CASE WHEN n >= 3 THEN 'hidden' ELSE 'reported' END;
    UPDATE public.community_answers SET status = st WHERE id = NEW.answer_id AND status <> 'hidden';
  END IF;
  PERFORM set_config('community.system', 'off', true);
  RETURN NULL;
END $$;
CREATE TRIGGER community_reports_apply AFTER INSERT ON public.community_reports FOR EACH ROW EXECUTE FUNCTION public.community_apply_report();

-- Points: 1 per counted helpful vote on visible content, +2 for the first answer on a post that got a counted vote
CREATE OR REPLACE FUNCTION public.community_points_for(_ids uuid[]) RETURNS TABLE(user_id uuid, points int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH vote_pts AS (
    SELECT p.author_id AS uid, count(*)::int AS pts FROM public.community_votes v
      JOIN public.community_posts p ON p.id = v.post_id
      WHERE v.counts AND p.status = 'visible' AND p.author_id = ANY(_ids) GROUP BY 1
    UNION ALL
    SELECT a.author_id, count(*)::int FROM public.community_votes v
      JOIN public.community_answers a ON a.id = v.answer_id
      WHERE v.counts AND a.status = 'visible' AND a.author_id = ANY(_ids) GROUP BY 1
  ), first_helpful AS (
    SELECT DISTINCT ON (a.post_id) a.id, a.author_id, a.status FROM public.community_answers a
      WHERE a.parent_id IS NULL AND EXISTS (SELECT 1 FROM public.community_votes v WHERE v.answer_id = a.id AND v.counts)
      ORDER BY a.post_id, a.created_at
  ), bonus AS (
    SELECT author_id AS uid, (2 * count(*))::int AS pts FROM first_helpful WHERE status = 'visible' AND author_id = ANY(_ids) GROUP BY 1
  )
  SELECT u, coalesce((SELECT sum(pts) FROM (SELECT pts FROM vote_pts WHERE uid = u UNION ALL SELECT pts FROM bonus WHERE uid = u) x), 0)::int
  FROM unnest(_ids) AS u
$$;

CREATE OR REPLACE FUNCTION public.community_first_helpful(_post_id uuid) RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id FROM public.community_answers a
  WHERE a.post_id = _post_id AND a.parent_id IS NULL AND public.is_provider(auth.uid())
    AND EXISTS (SELECT 1 FROM public.community_votes v WHERE v.answer_id = a.id AND v.counts)
  ORDER BY a.created_at LIMIT 1
$$;

-- Public author info for providers: display name, job role and points (no email or other profile data)
CREATE OR REPLACE FUNCTION public.community_authors(_ids uuid[]) RETURNS TABLE(user_id uuid, display_name text, job_role text, points int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pr.id, coalesce(nullif(pr.display_name, ''), 'Colleague'), pr.role, pts.points
  FROM public.profiles pr JOIN public.community_points_for(_ids) pts ON pts.user_id = pr.id
  WHERE public.is_provider(auth.uid())
$$;

-- My stats: points, level and weekly streak (one skipped week forgiven per 4 weeks)
CREATE OR REPLACE FUNCTION public.community_my_stats() RETURNS TABLE(points int, level text, streak int)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE me uuid := auth.uid(); pts int; cur int; w int; s int := 0; last_skip int := NULL; weeks int[];
BEGIN
  IF me IS NULL THEN RETURN; END IF;
  SELECT p.points INTO pts FROM public.community_points_for(ARRAY[me]) p;
  SELECT array_agg(DISTINCT wk) INTO weeks FROM (
    SELECT floor(extract(epoch FROM date_trunc('week', created_at)) / 604800)::int AS wk FROM public.community_posts WHERE author_id = me
    UNION SELECT floor(extract(epoch FROM date_trunc('week', created_at)) / 604800)::int FROM public.community_answers WHERE author_id = me
    UNION SELECT floor(extract(epoch FROM date_trunc('week', created_at)) / 604800)::int FROM public.community_votes WHERE voter_id = me
  ) x;
  weeks := coalesce(weeks, '{}');
  cur := floor(extract(epoch FROM date_trunc('week', now())) / 604800)::int;
  w := cur;
  WHILE w > cur - 520 LOOP
    IF w = ANY(weeks) THEN s := s + 1;
    ELSIF w <> cur THEN
      IF s > 0 AND (w - 1) = ANY(weeks) AND (last_skip IS NULL OR last_skip - w >= 4) THEN last_skip := w;
      ELSE EXIT; END IF;
    END IF;
    w := w - 1;
  END LOOP;
  RETURN QUERY SELECT pts, CASE WHEN pts >= 50 THEN 'Trusted' WHEN pts >= 10 THEN 'Helper' ELSE 'Newcomer' END, s;
END $$;

REVOKE EXECUTE ON FUNCTION public.community_points_for(uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.community_authors(uuid[]), public.community_my_stats(), public.community_first_helpful(uuid), public.is_provider(uuid), public.is_community_moderator(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.community_authors(uuid[]), public.community_my_stats(), public.community_first_helpful(uuid) FROM anon;