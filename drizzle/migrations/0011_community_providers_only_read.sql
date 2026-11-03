CREATE OR REPLACE FUNCTION public.is_community_reader(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('provider','moderator','admin'))
$$;

DROP POLICY IF EXISTS "Read own or moderate reports" ON public.community_reports;
CREATE POLICY "Read own or moderate reports" ON public.community_reports FOR SELECT TO authenticated
  USING ((reporter_id = auth.uid() AND public.is_provider(auth.uid())) OR public.is_community_moderator(auth.uid()));

CREATE OR REPLACE FUNCTION public.admin_list_accounts() RETURNS TABLE(user_id uuid, email text, display_name text, profession text, institution text, created_at timestamptz, roles text[])
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only admins can do this.'; END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, coalesce(p.display_name, ''), coalesce(p.role, ''), coalesce(p.institution, ''), u.created_at,
         coalesce(array_agg(r.role::text ORDER BY r.role::text) FILTER (WHERE r.role IS NOT NULL), '{}')
  FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id LEFT JOIN public.user_roles r ON r.user_id = u.id
  GROUP BY u.id, u.email, p.display_name, p.role, p.institution, u.created_at
  HAVING NOT (bool_or(r.role = 'pending_provider') IS TRUE
              AND (btrim(coalesce(p.role, '')) = '' OR btrim(coalesce(p.institution, '')) = ''))
  ORDER BY u.created_at DESC;
END $$;

-- Approval only for pending accounts that completed profession and institution
CREATE OR REPLACE FUNCTION public.admin_review_provider(_user_id uuid, _approve boolean) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Only admins can do this.'; END IF;
  IF _approve AND EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND (btrim(role) = '' OR btrim(institution) = '')) THEN
    RAISE EXCEPTION 'This account has not given a profession and institution yet.';
  END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id AND role IN ('pending_provider','provider');
  IF _approve THEN INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'provider') ON CONFLICT DO NOTHING; END IF;
END $$;