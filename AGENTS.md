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
