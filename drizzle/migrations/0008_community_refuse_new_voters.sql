CREATE OR REPLACE FUNCTION public.community_level(_points int) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT CASE WHEN _points >= 50 THEN 'Trusted' WHEN _points >= 10 THEN 'Helper' ELSE 'Newcomer' END
$$;

CREATE OR REPLACE FUNCTION public.community_check_vote() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE target_author uuid; n int; voter_created timestamptz;
BEGIN
  IF NEW.post_id IS NOT NULL THEN SELECT author_id INTO target_author FROM public.community_posts WHERE id = NEW.post_id;
  ELSE SELECT author_id INTO target_author FROM public.community_answers WHERE id = NEW.answer_id; END IF;
  IF target_author IS NULL THEN RAISE EXCEPTION 'This item no longer exists.'; END IF;
  IF target_author = NEW.voter_id THEN RAISE EXCEPTION 'You can''t mark your own content as helpful.'; END IF;
  SELECT created_at INTO voter_created FROM auth.users WHERE id = NEW.voter_id;
  IF voter_created IS NULL OR voter_created > now() - interval '7 days' THEN
    RAISE EXCEPTION 'Helpful votes are possible once your account is 7 days old.';
  END IF;
  SELECT count(*) INTO n FROM public.community_votes WHERE voter_id = NEW.voter_id AND created_at > now() - interval '1 day';
  IF n >= 10 THEN RAISE EXCEPTION 'You can give up to 10 helpful votes per day.'; END IF;
  NEW.counts := true;
  NEW.created_at := now();
  RETURN NEW;
END $$;

-- Votes can only be added or removed, never edited (keeps counts and timestamps server-controlled)
REVOKE UPDATE ON public.community_votes FROM authenticated;

CREATE OR REPLACE FUNCTION public.community_authors(_ids uuid[]) RETURNS TABLE(user_id uuid, display_name text, job_role text, points int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pr.id, coalesce(nullif(pr.display_name, ''), 'Colleague'), pr.role, pts.points
  FROM public.profiles pr JOIN public.community_points_for(_ids) pts ON pts.user_id = pr.id
  WHERE public.is_provider(auth.uid())
$$;

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
  RETURN QUERY SELECT coalesce(pts, 0), public.community_level(coalesce(pts, 0)), s;
END $$;