GRANT INSERT ON public.community_mod_log TO authenticated;
CREATE POLICY "Moderators write log" ON public.community_mod_log FOR INSERT TO authenticated
  WITH CHECK (public.is_community_moderator(auth.uid()) AND decided_by <> 'ai');