# TikTok-First Pivot — Specifications

## Background

The target audience is TikTok users who create paper bingo boards for their 2026 goals. Their current workflow: draw a grid on paper, write goals, decorate it, photograph it for TikTok. The paper board is great for the initial post but useless for follow-through — nobody pulls it out months later to update progress and re-share.

This app fills that gap: as fast and fun as paper for creation, better-looking for sharing, and actually useful after day one. The two critical missing pieces are:

1. **Users hit an auth wall before seeing anything** — instant bounce for TikTok traffic
2. **No way to share boards** — kills the viral loop that makes this audience work

This spec covers these two features only.

---

## Feature 1: Anonymous Board Creation

### Problem

The current flow:
1. User lands on `/` → redirect to `/auth/login`
2. Enter email → wait for magic link → check email → click link → redirect to `/dashboard`
3. Create board via modal (name + size) → navigate to board → start adding goals

A TikTok user tapping a link will leave at step 2. They haven't seen the product do anything yet.

### Desired Flow

1. User lands on `/` → sees a "Create your board" prompt immediately
2. Pick a size (default 5x5), optionally name the board → board appears instantly
3. Fill in goals, check things off — full functionality, no sign-up
4. When they want to save/share, prompt: "Sign up to save your board"
5. After sign-up, their anonymous board transfers to their account seamlessly

### Technical Approach

**Option A: localStorage-only for anonymous users**

Store the anonymous board entirely in localStorage. No Supabase interaction until sign-up.

- Pros: No backend changes. No RLS complications. Simple.
- Cons: Board lost if user clears browser data before signing up. No sharing (board only exists locally). Can't work across devices.

**Option B: Supabase anonymous auth**

Use [Supabase anonymous sign-in](https://supabase.com/docs/guides/auth/auth-anonymous) to create a temporary anonymous session. The board is stored in the database from the start. When the user signs up, Supabase links the anonymous session to the real account.

- Pros: Board is persisted in DB immediately. Sharing works (board has a real ID). Cross-device if they bookmark. Clean migration path via `linkIdentity()`.
- Cons: Requires enabling anonymous auth in Supabase dashboard. Creates orphan data for users who never sign up (need cleanup strategy). Slight RLS changes needed.

**Recommendation: Option B (Supabase anonymous auth)**

It sets up sharing (Feature 2) cleanly since the board has a real database ID from the start. Orphan cleanup can be a cron job that deletes anonymous-only boards older than 30 days.

### Data Model Changes

No schema changes needed. The existing `boards.user_id` will reference the anonymous user's UUID (Supabase assigns one on anonymous sign-in). When the user converts to a real account via `linkIdentity()`, the UUID stays the same, so all foreign keys remain valid.

**RLS policy addition needed:**
- Boards need a new SELECT policy allowing unauthenticated reads for public/shared boards (see Feature 2). The existing `auth.uid() = user_id` policies handle anonymous users fine since they do get a `uid`.

### Implementation Scope

**Routes:**
- `src/routes/+page.svelte` — Replace redirect-to-login with inline board creation UI
- `src/routes/auth/login/+page.svelte` — Keep as-is for explicit login

**Stores:**
- `src/lib/stores/auth.ts` — Add `signInAnonymously()` method, auto-trigger on first visit if no session
- `src/lib/stores/boards.ts` — No changes needed (already uses `supabase.auth.getUser()`)

**Components:**
- `src/lib/components/AuthGuard.svelte` — Update to allow anonymous users through (they're authenticated, just anonymous)
- New: inline board creation on landing page (replace the redirect logic)

**Supabase dashboard:**
- Enable anonymous sign-in in Authentication → Providers

### Conversion Prompt

When to prompt sign-up:
- User taps "Share" (Feature 2)
- User returns to the app after 24 hours (gentle nudge, not blocking)
- User creates a second board

The prompt should be non-blocking: "Sign up to save your board across devices" with a dismiss option. Never block functionality behind sign-up except sharing.

### Edge Cases

- **User clears cookies**: Anonymous session is lost. Board is orphaned in DB (cleaned up by cron). User starts fresh.
- **User signs up with same email later**: New account, doesn't recover the orphaned board. This is acceptable for V1.
- **Orphan cleanup**: Cron job deletes anonymous-user boards older than 30 days with no linked real identity.

### Open Questions

- [ ] Default board size: Should we default to 5x5 (most popular on TikTok) or still show the size picker?
- [ ] Board naming: Should we skip the name field for anonymous creation and auto-name it ("My 2026 Goals")?
- [ ] Rate limiting: Any concern about abuse with anonymous auth? Supabase may have built-in rate limits.

---

## Feature 2: Share-as-Image Export

### Problem

TikTok users share visually. The current app has no way to get a board out of the app — no image export, no public links, no share buttons. The board looks decent in the browser but can't be posted anywhere.

### Desired Outcome

One tap → a shareable image of the board, ready to post on TikTok/Instagram/X. The image should look polished enough that users prefer it over their hand-drawn version.

### What the Image Should Include

- The full board grid with goal titles visible
- Completion status (checkmarks on completed goals)
- Bingo line highlights (if any lines are complete)
- Board title at the top
- Subtle app branding/watermark (small, bottom corner — acts as organic distribution)
- Clean background (not a screenshot of browser UI)

### What the Image Should NOT Include

- Notes/milestones (too detailed for a shareable image)
- Browser chrome, scrollbars, or UI controls
- User email or personal info

### Technical Approach

Use `html-to-image` (or `html2canvas`) to render the board component to a PNG/JPEG.

**Why `html-to-image`:**
- Renders DOM to canvas/SVG/PNG directly
- Handles CSS (including Tailwind) accurately
- Small bundle size (~5KB gzipped)
- Actively maintained, widely used

**Flow:**
1. User taps "Share" button (new button in board header)
2. App renders a dedicated export-ready version of the board (hidden in DOM, styled for export)
3. `html-to-image` converts it to a PNG blob
4. On mobile: trigger native share sheet via `navigator.share()` (supports TikTok, Instagram, etc.)
5. On desktop: download the PNG file
6. Fallback: copy image to clipboard

**Why a separate export-ready DOM element:**
The visible board has responsive sizing, hover states, and interactive elements that don't make sense in a static image. The export version should be fixed-size, styled for the target aspect ratio, with no interactive elements.

### Image Sizing

Target formats for social media:
- **Default: 1080x1080px** (square, works everywhere — TikTok, Instagram, X)
- Future: 1080x1920px (9:16 for TikTok/Instagram stories)

The export component should render at a fixed pixel size regardless of screen dimensions.

### Implementation Scope

**New dependency:**
- `html-to-image` (or `dom-to-image-more` as alternative)

**Components:**
- New: `ShareButton` component in board header (next to font selector)
- New: `ExportableBoard` component — a non-interactive, fixed-size version of the board styled for image export. Rendered hidden in the DOM, used only as input to `html-to-image`

**Routes:**
- `src/routes/boards/[id]/+page.svelte` — Add ShareButton to header

**Utilities:**
- New: `src/lib/utils/export.ts` — Export logic: render to image, trigger download/share

### UX Details

**Share button location:** Board header, next to the font selector. Icon: share/upload icon. Label: "Share".

**Loading state:** Show a brief spinner while the image renders (typically <1 second).

**Mobile share sheet:** Use `navigator.share({ files: [imageFile] })`. This opens the native OS share sheet, which includes TikTok, Instagram, Messages, etc. Check `navigator.canShare()` first.

**Desktop fallback:** Download the image as `{board-name}-bingo.png`. Optional: "Copy to clipboard" button.

**Anonymous users:** Share-as-image should work without sign-up. The image is generated client-side and doesn't require database access. This is intentional — let anonymous users share, and the watermark/branding drives new users to the app.

### Export Styling

The exported image needs to look better than the in-app board since it's meant for social media. Considerations:

- Slightly more padding/spacing than the interactive version
- Board title rendered larger and more prominent
- Completion checkmarks more visible (thicker, higher contrast)
- Bingo line highlights more dramatic
- App branding: small text or logo in bottom-right corner
- Background: subtle gradient or solid color (not plain white)

### Open Questions

- [ ] Should we include a progress summary in the image? (e.g., "12/25 goals completed")
- [ ] Watermark style: text ("made with bingo.app") or logo? How prominent?
- [ ] Should the exported image use the selected font, or a consistent export font?
- [ ] Do we want to support video/animated export in the future? (e.g., board filling in)

---

## Out of Scope (Future Work)

These were identified as valuable but are not part of this spec:

1. **Public board links** — shareable URLs showing a read-only view of a board
2. **Visual themes** — color palettes, backgrounds, board customization
3. **Progress sharing moments** — "I got my first bingo!" as a shareable card
4. **Social features** — viewing other users' boards, comments, reactions
5. **Push notifications** — reminders to check in on goals
