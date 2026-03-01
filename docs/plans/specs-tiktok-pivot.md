# TikTok-First Pivot — Specifications

## Background

The target audience is TikTok users who create paper bingo boards for their 2026 goals. Their current workflow: draw a grid on paper, write goals, decorate it, photograph it for TikTok. The paper board is great for the initial post but useless for follow-through — nobody pulls it out months later to update progress and re-share.

This app fills that gap: as fast and fun as paper for creation, better-looking for sharing, and actually useful after day one. The two critical missing pieces are:

1. **Users hit an auth wall before seeing anything** — instant bounce for TikTok traffic
2. **No way to share boards** — kills the viral loop that makes this audience work

This spec covers these two features only.

---

## Marketing & Positioning

### The Core Insight

There's a viral trend happening right now: TikTok users are creating hand-drawn bingo boards for their 2026 goals. Thousands of these boards are being posted weekly. But there's a gap:

**The boards look great in the initial TikTok video. Then they sit on a shelf and get forgotten.**

Nobody posts progress updates. Nobody re-shares when they complete a line. The trend dies after January because paper boards aren't designed for follow-through.

### The Opportunity

We're not creating a trend — we're **digitizing an existing behavior**. This is fundamentally different from launching another productivity app. The market has already validated the format. We just need to execute better than paper.

### Positioning Statement

> **"Turn your 2026 goals into a bingo board you'll actually finish."**

Not "another goal tracker." Not "gamified productivity." It's specifically for people who **already like the bingo board concept** but need a better way to execute on it.

### Key Differentiators

| What we're NOT | What we ARE |
|---|---|
| Another productivity app competing with Notion/Todoist | A TikTok-native tool for an existing trend |
| Serious/enterprise goal tracking | Fun, visual, shareable goal tracking |
| Designed for habit streaks and daily check-ins | Designed for medium-term goals you check monthly |
| Feature-heavy with complex workflows | Dead simple: make board → share board → check off goals → re-share progress |

### Target Audience Segments

**Primary: TikTok Goal-Setters (18-28, female-skewed)**
- Already making paper bingo boards
- Active on TikTok, Instagram, Pinterest
- Setting 2026 goals in categories: fitness, reading, travel, personal growth
- Want accountability but not rigid systems
- Share their progress visually

**Secondary: Casual Goal Trackers (25-35)**
- Like the idea of New Year's goals but don't stick to them
- Have tried journaling/apps but found them too heavy
- Attracted to the fun/game aspect of bingo
- Would share if it looked good enough

**Not our audience (at launch):**
- Serious productivity optimizers (they want more features than we offer)
- Corporate goal-tracking (OKRs, performance management)
- Daily habit trackers (this is monthly/quarterly goals)

### Marketing Messages by Channel

**TikTok/Instagram (Primary Acquisition Channel)**

Headline: *"Stop losing your goals bingo board"*

Hook:
- "POV: You made a goals bingo board in January and forgot about it by March"
- "Your 2026 goals deserve better than a crumpled piece of paper"
- Show side-by-side: hand-drawn board (January) → our app (still checking it in July)

Call-to-action: "Create yours in 30 seconds" → link to app

**Product Hunt / Indie Hackers**

Headline: *"Bingo boards for goals — but digital and shareable"*

Angle: Riding an existing trend, not inventing one. Built with SvelteKit, zero friction (anonymous auth), viral loop built-in (share-as-image).

Emphasize: We're not trying to out-feature Notion. We're trying to be faster than paper.

**Reddit (r/productivity, r/getdisciplined)**

Headline: *"I built a goals bingo board app because paper ones get forgotten"*

Angle: Personal story. "I saw the trend on TikTok. Made my own. Lost it within a month. Built this so it actually sticks around."

Emphasize: The follow-through gap. Paper is great for the initial dopamine hit but terrible for accountability.

**Twitter/X**

"The 2026 goals bingo trend is everywhere on TikTok. Built an app so people actually finish them instead of losing the paper in February."

Attach: Screenshot or video of the board + share feature

### Growth Strategy

**Viral Loop:**
1. User creates board (anonymous, zero friction)
2. User shares board image to TikTok/Instagram (watermarked with app branding)
3. New user sees the watermark → clicks → lands on app → creates board (repeat)

**Why this works:**
- Share-as-image is core to the product, not tacked on
- The exported image looks better than hand-drawn versions (users actually prefer sharing ours)
- Watermark is subtle but visible (bottom corner, small text)
- Anonymous creation means zero friction from viral traffic

**Retention Strategy:**
- Push notifications for monthly check-ins (opt-in)
- Email: "You haven't updated your board in 30 days — here's what's left"
- Re-share moments: "You just completed your first bingo! Share your progress"

**Monetization (Future):**
- Freemium: 1 board free, unlimited boards for $3/month
- Premium themes/fonts/export options
- Remove watermark from exports (paid tier)

### Why Now?

**Timing is critical:**
- The TikTok trend is happening **right now** (Jan-Feb 2026)
- If we launch in March, we ride the wave
- If we wait until next January, the trend may be stale
- Paper boards have obvious pain points (easily lost, not shareable digitally, no progress tracking)

**Competitive landscape:**
- No direct competitors targeting this specific trend
- Generic goal apps (Notion, Todoist) are too heavy
- Bingo board makers exist but aren't designed for goals + sharing
- We're first-mover for this specific niche

### Success Metrics

**Week 1:**
- 1,000 boards created (validates low-friction creation)
- 200 shares via share-as-image (validates core loop)
- 10% anonymous → sign-up conversion

**Month 1:**
- 10,000 total boards created
- 20% of users re-sharing progress (proves retention value)
- Organic TikTok mentions from watermarked shares

**Month 3:**
- 50% of traffic coming from watermarked shares (viral loop working)
- Avg 2.5 boards per signed-up user
- Users checking back monthly (not daily — that's correct for this use case)

### Taglines / Copy Options

**Hero Section (Landing Page):**
- "Turn your 2026 goals into a bingo board you'll actually finish"
- "Make it. Share it. Actually do it."
- "Goals bingo, but you won't lose this one in February"

**App Store / Chrome Extension:**
- "Bingo boards for your goals — track visually, share progress, celebrate bingos"

**Social Proof:**
- "Join 10,000+ people actually finishing their 2026 goals"
- "The bingo board you won't forget in your drawer"

### Content Strategy

**Launch Week:**
- TikTok video: "I built this after losing my paper goals board"
- Product Hunt: "Bingo boards for goals, built for the TikTok generation"
- Twitter thread: "Why paper bingo boards fail + how we fixed it"

**Ongoing:**
- User testimonials: Before/after (paper board → app → actually completing goals)
- Progress shares: Repost users hitting their first bingo
- Templates: Pre-filled boards for fitness, reading, travel
- Monthly: "Here's how many people completed bingos this month"

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
