# MedBridge public website

## What I’ll build
- Replace the empty page with a public MedBridge welcome page explaining the service in two sentences, a three-point “How it helps” section, and Log in and Register actions.
- Add a shared responsive top navigation with the MedBridge logo and Home, Notes, Community, and Settings links, including clear active states.
- Add empty placeholder pages for Notes, Community, and Settings.
- Add separate mock Log in and Register pages with email and password fields; place a short MedBridge signup guide beside the registration form.
- Use the exact privacy note: “MedBridge does not store patient data.”

## Design
- Use a calm blue-and-white system, one clean sans-serif font, rounded cards, generous spacing, and restrained shadows.
- Keep the information dense enough for clinicians to scan quickly, while preserving clear hierarchy and accessibility.
- Adapt gracefully to narrower screens while prioritizing the requested desktop experience.

## Technical details
- Use static mock content and mock authentication only, with no persistence, uploads, patient fields, backend, or external services.
- Use existing React, Tailwind, and interface controls; add only small local components where needed.
- Add page-specific metadata for every page and verify navigation, forms, desktop presentation, and narrow-screen behavior in the browser.