ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution text NOT NULL DEFAULT '';
COMMENT ON COLUMN public.profiles.account_role IS 'DEPRECATED: roles live only in public.user_roles';

-- Users can never write their own roles; only admin functions below can.
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated, anon;

CREATE OR REPLACE FUNCTION public.is_provider(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('provider','moderator','admin'))
$$;

CREATE OR REPLACE FUNCTION public.is_community_reader(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('pending_provider','provider','moderator','admin'))
$$;
GRANT EXECUTE ON FUNCTION public.is_community_reader(uuid) TO authenticated;

DROP POLICY "Providers read visible posts" ON public.community_posts;
CREATE POLICY "Providers read visible posts" ON public.community_posts FOR SELECT TO authenticated
  USING (public.is_community_reader(auth.uid()) AND (status <> 'hidden' OR author_id = auth.uid() OR public.is_community_moderator(auth.uid())));
DROP POLICY "Providers read visible answers" ON public.community_answers;
CREATE POLICY "Providers read visible answers" ON public.community_answers FOR SELECT TO authenticated
  USING (public.is_community_reader(auth.uid()) AND (status <> 'hidden' OR author_id = auth.uid() OR public.is_community_moderator(auth.uid())));
DROP POLICY "Providers read votes" ON public.community_votes;
CREATE POLICY "Providers read votes" ON public.community_votes FOR SELECT TO authenticated USING (public.is_community_reader(auth.uid()));

CREATE OR REPLACE FUNCTION public.community_authors(_ids uuid[]) RETURNS TABLE(user_id uuid, display_name text, job_role text, points int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT pr.id, coalesce(nullif(pr.display_name, ''), 'Colleague'), pr.role, pts.points
  FROM public.profiles pr JOIN public.community_points_for(_ids) pts ON pts.user_id = pr.id
  WHERE public.is_community_reader(auth.uid())
$$;

-- New sign-ups: profile + pending_provider role
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role, institution)
  VALUES (
    NEW.id,
    left(coalesce(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', ''), 100),
    left(coalesce(NEW.raw_user_meta_data->>'role', ''), 60),
    left(coalesce(NEW.raw_user_meta_data->>'institution', ''), 120)
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'pending_provider') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

-- Existing non-admin accounts become pending providers
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'pending_provider' FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role IN ('admin','provider','pending_provider'))
ON CONFLICT DO NOTHING;

-- Admin: list accounts with roles
CREATE OR REPLACE FUNCTION public.admin_list_accounts() RETURNS TABLE(user_id uuid, email text, display_name text, profession text, institution text, created_at timestamptz, roles text[])
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only admins can do this.'; END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, coalesce(p.display_name, ''), coalesce(p.role, ''), coalesce(p.institution, ''), u.created_at,
         coalesce(array_agg(r.role::text ORDER BY r.role::text) FILTER (WHERE r.role IS NOT NULL), '{}')
  FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id LEFT JOIN public.user_roles r ON r.user_id = u.id
  GROUP BY u.id, u.email, p.display_name, p.role, p.institution, u.created_at
  ORDER BY u.created_at DESC;
END $$;

-- Admin: approve or reject a pending provider
CREATE OR REPLACE FUNCTION public.admin_review_provider(_user_id uuid, _approve boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only admins can do this.'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role IN ('pending_provider','provider');
  IF _approve THEN INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'provider') ON CONFLICT DO NOTHING; END IF;
END $$;

-- Admin: grant or remove admin / moderator
CREATE OR REPLACE FUNCTION public.admin_set_role(_user_id uuid, _role public.app_role, _grant boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only admins can do this.'; END IF;
  IF _role NOT IN ('admin','moderator') THEN RAISE EXCEPTION 'Only admin and moderator can be set here.'; END IF;
  IF NOT _grant AND _role = 'admin' AND _user_id = auth.uid() THEN RAISE EXCEPTION 'You cannot remove your own admin role.'; END IF;
  IF _grant THEN INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role) ON CONFLICT DO NOTHING;
  ELSE DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role; END IF;
END $$;

REVOKE EXECUTE ON FUNCTION public.admin_list_accounts(), public.admin_review_provider(uuid, boolean), public.admin_set_role(uuid, public.app_role, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_accounts(), public.admin_review_provider(uuid, boolean), public.admin_set_role(uuid, public.app_role, boolean) TO authenticated;