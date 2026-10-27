ALTER TABLE public.profiles
  ADD COLUMN account_role text NOT NULL DEFAULT 'provider' CHECK (account_role IN ('provider', 'patient'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role, account_role)
  VALUES (
    NEW.id,
    left(coalesce(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', ''), 100),
    left(coalesce(NEW.raw_user_meta_data->>'role', ''), 60),
    CASE WHEN NEW.raw_user_meta_data->>'account_role' = 'patient' THEN 'patient' ELSE 'provider' END
  );
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;