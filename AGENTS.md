<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep MedBridge public pages in file-based routes and shared navigation in the root layout so every page has consistent access and active states.
- Signed-in-only pages live under src/routes/_authenticated/ (client-side gate redirecting to /login); public pages stay top-level — keeps access rules in one place.
- Cases and notes live in browser storage via src/lib/local-store.ts; community posts, answers, votes, reports, warnings and the moderation log live in the backend (src/lib/community.ts, src/lib/moderation-data.ts) linked to account ids — keeps patient-related content off servers while community is shared.
- Community rules (provider-only access, own-content writes, moderator-only status changes, posting/vote limits, points, levels, streaks) are enforced in the database via RLS, triggers and security-definer functions; the browser only displays results — so they cannot be tampered with.
- All roles (pending_provider, provider, moderator, admin) live only in public.user_roles; users cannot write it — sign-up trigger adds pending_provider, and only admin SECURITY DEFINER functions (admin_review_provider, admin_set_role) change roles; profiles.account_role is deprecated — prevents privilege escalation.
- AI moderation may only keep items hidden or flag them back to 'reported'; it never deletes, and human moderators can reverse any decision.
- AI moderation runs in a createServerFn (src/lib/moderation.functions.ts) that requires a signed-in provider, reads the item itself and only acts on items the database has hidden — callers cannot choose the text or outcome.
- Handover QR codes are generated in the browser and encode the card text itself — nothing is fetched or stored on a server.
- Patient side lives under src/routes/patient* with no sign-in; patient pages store only the role, language, checklist ticks and a random device id (for translation limits) in browser storage; their only backend call is the public translate server fn (src/lib/translate.functions.ts), which never stores or logs text and enforces per-device-hour and app-wide daily quotas via a service-role-only SQL function that stores only a hashed device id and counts; patients never have accounts (only providers can register) — patients must never give personal data.
