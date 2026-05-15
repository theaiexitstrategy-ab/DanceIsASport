# danceisasport.com

A dancer profile + booking marketplace.

## Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres + RLS) via `@supabase/supabase-js`
- Cloudinary for video/photo uploads (unsigned, upload preset)
- Framer Motion for animations

## Routes
- `/` — landing page
- `/[handle]` — public dancer profile (e.g. `/jasmine.dances`)
- `/onboard` — 4-step dancer onboarding wizard

## Environment variables
All public, all required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

See `.env.local.example`.

## Supabase tables
- `dancers` — core profile (handle, bio, NIL info, is_published)
- `dancer_styles` — style tags (Contemporary, Hip-Hop, …)
- `dancer_services` — services (Music Video, Live Event, …) with price labels
- `dancer_media` — photo/video URLs from Cloudinary
- `booking_requests` — public inbound booking requests
- `dancer_reviews` — testimonials

RLS:
- Public read on `dancers WHERE is_published = true` and related rows (styles, services, media, reviews).
- Public insert on `booking_requests`.
- Anonymous insert on `dancers`, `dancer_styles`, `dancer_services`, `dancer_media` for the MVP onboarding flow (no auth yet).
- RPC `check_handle_available(p_handle text) RETURNS boolean` — security definer, callable by anon, used by onboarding step 1.

## Cloudinary
Uploads are unsigned via the upload preset. The browser POSTs directly to:
```
https://api.cloudinary.com/v1_1/<CLOUD_NAME>/<photo|video>/upload
```
Returned `secure_url` is stored in Supabase.

## Design system
- Primary `#7c5cbf` (purple), accent `#5bbfa0` (mint)
- Backgrounds `#faf9fc`, `#f3f1f8`, `#ede9f5`
- Text `#2a2535`, `#5a5468`
- Fonts: Cormorant Garamond (headings + bio), Jost (UI)
- Animations: floating particles, scroll reveals, count-up stats, shimmer, pulsing dots, spring modal

## Conventions
- Supabase clients live in `lib/supabase.ts`:
  - `serverSupabase()` — singleton, used in server components / route handlers.
  - `browserSupabase()` — per-call instance for client components.
  - Both lazy-init, so the build doesn't crash when env vars are missing locally.
- Hand-written interfaces in `lib/database.types.ts` (the project shares a Supabase instance with other apps; `generate_typescript_types` would emit ~120k chars). Used for typing select results; insert calls rely on Supabase runtime validation.
- Profile pages are server components (`export const dynamic = 'force-dynamic'`) with client-island modal + particle canvas + scroll reveals.
- Onboarding is a single client page with `useState` for step state.
