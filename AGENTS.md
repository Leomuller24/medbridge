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
- Cases, notes and community posts live in browser storage via src/lib/local-store.ts, seeded from example data; only account profile data goes to the backend — keeps patient-related content off servers.
- Admin rights come only from the public.user_roles table checked with has_role(); never from profile fields or browser storage — prevents privilege escalation.
- AI moderation runs in a createServerFn (src/lib/moderation.functions.ts) that requires sign-in; content is sent for review but never stored server-side — keeps the browser-only data rule.
- Handover QR codes are generated in the browser and encode the card text itself — nothing is fetched or stored on a server.
- Patient side lives under src/routes/patient* with no sign-in; patient pages store only the role, language and checklist ticks in browser storage and never call the backend; an optional patient account holds only email, password and profiles.account_role ('provider' default, so legacy users are providers) — patients must never give personal data.
