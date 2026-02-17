# Social Features — Implementation Plans

## Dependency Map

The social features build on the TikTok pivot spec (anonymous auth + share-as-image), which
has not yet been implemented. Attempting social features before those two are done creates
architectural problems (especially around public board access). The correct build order:

```
[EXISTING SPEC - must ship first]
Anonymous Auth (specs-tiktok-pivot.md Feature 1)
Share-as-Image (specs-tiktok-pivot.md Feature 2)
         │
         ├── Social 1: Public Board Links
         │         │
         │         ├── Social 3: Template Cloning
         │         ├── Social 6: Creator Profiles
         │         └── Social 5: Group Challenges (also needs Social 3)
         │
         ├── Social 2: Progress Milestone Cards  (needs Share-as-Image)
         ├── Social 7: Monthly Recap Images      (needs Share-as-Image)
         └── Social 8: Board Completion Cert     (needs Share-as-Image)

[Independent, infrastructure-heavy]
Social 4: Accountability Partners
```

---

## Social 1: Public Board Links

### What it does

A toggle on any board makes it publicly visible at its existing URL
(`/boards/[id]`). Anyone with the link can view the board read-only — no login
required. The board shows goals and completion state but no editing controls.
A "Create your own" CTA at the bottom drives the viral loop.

### Why this is first

Every other social feature either links to a public board (template cloning,
creator profiles, challenges) or implies one (accountability partners who want
to see the board). This is the unlock.

### DB changes

**Migration: add `is_public` to boards**

```sql
ALTER TABLE boards ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE;
CREATE INDEX idx_boards_is_public ON boards(is_public) WHERE is_public = TRUE;
```

**New RLS policies**

```sql
-- Anyone can view public boards
CREATE POLICY "Public boards are viewable by anyone"
  ON boards FOR SELECT
  USING (is_public = TRUE);

-- Anyone can view goals in public boards
CREATE POLICY "Goals in public boards are viewable by anyone"
  ON goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = goals.board_id
      AND boards.is_public = TRUE
    )
  );
```

The existing owner-only policies remain unchanged. Supabase evaluates policies
with OR — a user can access a board if they own it OR if it's public.

### Route changes

**`src/routes/boards/[id]/+page.svelte`** — this route already handles the
board view. Extend it:

- Load the board via a new `loadBoardPublic(id)` method that does not filter
  by `user_id` (relies purely on RLS — if the board is public, Supabase returns
  it; if not, it returns nothing)
- Determine at render time whether the current user is the owner
  (`board.user_id === currentUser?.id`)
- If owner: render the existing interactive BingoBoard
- If visitor (not owner): render a new `PublicBoardView` component

This avoids a separate route and keeps the URL clean — the same link works for
both owner and visitor.

### New components

**`PublicBoardView.svelte`**
- Non-interactive rendering of the board (goals are read-only, no click handlers)
- Shows completion state visually (checked goals, bingo line highlights)
- Header: board title, owner's display name (if they have a creator profile),
  completion stats ("12/25 goals")
- Footer: "Make your own bingo board →" CTA linking to `/` (creates a new
  anonymous board)
- No notes, no milestones, no editing controls

**Update `ShareButton.svelte`** (from Feature 2 of existing spec)
- Add "Copy link" option alongside "Download image"
- Only shown if `is_public` is true; if not, show "Make public to share link"

### Store changes

**`boardsStore`**
- Add `makePublic(boardId)` — sets `is_public = true`
- Add `makePrivate(boardId)` — sets `is_public = false`
- Add `loadBoardPublic(boardId)` — loads without user_id filter (for public
  board viewing by visitors)

### UX

Owner view (board header):
- New toggle: "🔒 Private" / "🌐 Public" — toggling makes the board public/private
- When public: a "Copy link" button appears next to the toggle
- One-time prompt on first making a board public: "Anyone with this link can
  see your board. Your notes and personal details won't be visible."

Visitor view:
- Clean read-only board, no auth gate
- Persistent bottom bar: "Create your own bingo board in 30 seconds →"
- If the visitor creates a board via that CTA, their new board pre-fills with
  the same goals (template behavior — see Social 3)

### Open questions

- [ ] Does making a board public affect milestones visibility? (Recommendation: no
  — milestones are personal details, same exclusion logic as share-as-image)
- [ ] Should there be a "Private" setting that's shareable-by-link-only (not
  indexed in gallery)? Or is the toggle just public/private? (Keep it simple for
  now: one toggle)

---

## Social 2: Progress Milestone Cards

### What it does

When specific events happen while a user is editing their board, a celebration
overlay appears with a pre-rendered shareable image. The user can share it
instantly or dismiss it.

This is a retention and re-engagement mechanic. The goal is to create natural
moments where users want to post an update to TikTok/Instagram.

### Events that trigger a milestone card

| Event | Trigger condition | Card copy |
|---|---|---|
| First goal completed | First goal ever checked on this board | "First step ✓" |
| First bingo | Bingo detection returns 1+ lines for the first time | "BINGO! 🎉" |
| Halfway there | 50% of goals completed (rounded down) | "Halfway there!" |
| Board complete | All goals checked | "I DID IT. 🏆" |

### No DB changes

Track which milestones have been shown per board in localStorage:
`bingo_milestones_shown_{boardId}` → `Set<'first_goal' | 'first_bingo' | 'halfway' | 'complete'>`

This is intentionally not persisted to DB — it's about prompting the share,
not permanent record-keeping.

### New components

**`MilestoneCelebration.svelte`**
- Modal overlay with subtle animation (not jarring — this is a positive moment)
- Shows a preview of the shareable card
- "Share" button → triggers the same share flow as the main share-as-image
- "Not now" → dismisses, marks milestone as shown in localStorage
- Does not block any board interaction while visible

**`ExportableMilestoneCard.svelte`**
- Hidden in DOM, used as input to `html-to-image`
- Fixed size: 1080x1080px
- Shows: event headline, board title, mini-grid (just completion dots, no goal
  text — keeps it readable at small size), app watermark
- Visually distinct from the main board export (more celebratory styling)

### Utility changes

**`src/lib/utils/export.ts`** (extends existing share-as-image utility)
- Add `generateMilestoneCardImage(board, event)` — renders `ExportableMilestoneCard`
  for the given event and returns the image blob

### Integration point

The milestone detection happens in `BingoBoard.svelte` (or wherever goal
completion is tracked). After any goal toggle:

1. Run `detectBingo(board)` — already happens for line highlights
2. Check completion percentage
3. Compare against `bingo_milestones_shown_{boardId}` in localStorage
4. If a new milestone is reached: set the celebration overlay visible
5. On share or dismiss: add the milestone to localStorage

### Open questions

- [ ] Should "first bingo" trigger even if the board was already at bingo state
  when the user loaded it (e.g., they imported it)? (Recommendation: only trigger
  on the transition from no-bingo to bingo, not on load)
- [ ] For the halfway card: do we round to nearest integer, or strictly 50%?
  (Recommendation: trigger at `floor(total/2)` completed to avoid edge cases)

---

## Social 3: Template Cloning

### What it does

Anyone viewing a public board can tap "Use this board" to get their own copy
pre-filled with the same goals (not completion state, not notes). This is the
highest-leverage viral mechanic: one popular TikToker's board → thousands of
identical boards, each with the app watermark.

### Requires

Social 1 (public board links) — the public board view is where the CTA lives.

### No DB changes

Cloning is just `boardsStore.createBoard()` called with the source board's name
and size, followed by `goals` insert with the source board's goal titles.

### Store changes

**`boardsStore`**
- Add `cloneBoard(sourceBoardId)`:
  1. Fetch the source board (works because RLS allows public boards to be read)
  2. Create a new board with the same name + size for the current user
  3. Insert goals with the source goal titles, `completed: false`, notes `''`
  4. Return the new board

### UX

In `PublicBoardView.svelte`:
- Prominent header button: "Use this board"
- If the user is logged in (or anonymous): clone immediately, redirect to their
  new board with toast "Your board is ready — start filling it in!"
- If anonymous (no session at all): trigger anonymous sign-in first
  (already handled by Feature 1 of the TikTok spec), then clone

The "Use this board" experience should feel instant. Cloning is fast (one
board + N goals insert). No modals, no confirmation — just redirect.

### Edge cases

- Source board becomes private after user clones it: no problem — the clone is
  its own independent board, no link to the source after creation
- User clones the same board twice: they get two copies, which is fine

---

## Social 4: Accountability Partners

### What it does

A board owner invites one person (by email or shareable link) to follow their
board. The follower sees a read-only view and gets emailed when the owner checks
off goals. The follower can send a simple reaction (emoji).

This directly addresses the spec's core insight: paper boards fail at
follow-through because nobody's watching. An accountability partner fixes that.

### This is the heaviest feature — read before committing

Requires:
- A new email notification system (Supabase Edge Function or third-party)
- A `board_followers` table and accompanying RLS
- A `board_reactions` table
- An invite token flow
- Email sending infrastructure

Recommendation: implement the invite + read-only follow flow first (no email
notifications), then layer in email notifications as a separate step.

### DB changes

```sql
-- Tracks who is following a board
CREATE TABLE board_followers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  follower_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_email VARCHAR(255),          -- email the invite was sent to
  invite_token UUID UNIQUE DEFAULT uuid_generate_v4(), -- one-time invite link token
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_board_followers_board_id ON board_followers(board_id);
CREATE INDEX idx_board_followers_token ON board_followers(invite_token);
CREATE INDEX idx_board_followers_user_id ON board_followers(follower_user_id);

-- Reactions from followers
CREATE TABLE board_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  follower_id UUID NOT NULL REFERENCES board_followers(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**RLS for `board_followers`:**

```sql
ALTER TABLE board_followers ENABLE ROW LEVEL SECURITY;

-- Board owners can see who follows their boards
CREATE POLICY "Board owners can view followers"
  ON board_followers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = board_id AND boards.user_id = auth.uid())
  );

-- Board owners can insert followers (invite)
CREATE POLICY "Board owners can invite followers"
  ON board_followers FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM boards WHERE boards.id = board_id AND boards.user_id = auth.uid())
  );

-- Followers can read their own follow record (needed to look up their access)
CREATE POLICY "Followers can view their own record"
  ON board_followers FOR SELECT
  USING (follower_user_id = auth.uid());

-- Anyone can read a follow record by token (needed for invite link flow)
-- Scoped to just the invite_token lookup via a function
CREATE POLICY "Invite token lookup"
  ON board_followers FOR SELECT
  USING (TRUE); -- This is intentionally open; token is effectively a password
                -- Consider using a Supabase RPC function instead for better security
```

**RLS for board access by followers:**

```sql
-- Followers can view the boards they follow
CREATE POLICY "Followers can view followed boards"
  ON boards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM board_followers
      WHERE board_followers.board_id = boards.id
      AND board_followers.follower_user_id = auth.uid()
      AND board_followers.accepted_at IS NOT NULL
    )
  );

-- Followers can view goals in boards they follow
CREATE POLICY "Followers can view goals in followed boards"
  ON goals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM board_followers
      WHERE board_followers.board_id = goals.board_id
      AND board_followers.follower_user_id = auth.uid()
      AND board_followers.accepted_at IS NOT NULL
    )
  );
```

### Routes

**`src/routes/follow/[token]/+page.svelte`** — invite landing page
- Looks up the token, shows the board name and owner
- If not logged in: prompts sign-up ("Sign up to follow [owner]'s board")
- On sign-up/login: sets `follower_user_id` and `accepted_at` on the record
- Redirects to a follower view of the board

### New components

**`FollowerView.svelte`**
- Read-only board (similar to `PublicBoardView.svelte` but with personal context)
- Shows owner's name + board name in header
- Emoji reaction bar at bottom: 💪 🎉 ❤️ 🔥
- Shows when the owner last updated the board

**`InvitePartnerModal.svelte`**
- Owner opens this from the board header
- Input: email address (optional — can just share the link)
- Generates and displays the invite link
- Shows list of current followers and their last reaction

**`ReactionBadge.svelte`**
- Small badge on the board owner's view showing recent reactions from followers

### Email notifications

Phase 1 (ship without this, add later):
- No emails — follower has to manually check in

Phase 2 (requires Supabase Edge Function):
- When a goal is marked complete: fire a Supabase database webhook
- Edge function sends email to all accepted followers of that board
- Email body: "[Owner] just completed '[Goal title]' on their bingo board — send them a reaction!"
- Link in email: goes to follower's view of the board

---

## Social 5: Group Challenges

### What it does

A board owner "publishes" their board as a challenge with a shareable link and
a slug (e.g., `/challenge/read-25-books`). Others join by cloning the board
into their own account, with their clone linked to the challenge. A leaderboard
shows the top completers.

This is enormous for TikTok: "Do my 2026 reading bingo challenge with me →
[link]". The challenge link is the distribution mechanism.

### Requires

Social 1 (public board links) and Social 3 (template cloning) — challenges are
essentially named templates with a leaderboard.

### DB changes

```sql
-- A published challenge based on a board
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_board_id UUID NOT NULL REFERENCES boards(id) ON DELETE RESTRICT,
  host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,    -- URL-safe, e.g. "read-25-books-2026"
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  participant_count INTEGER DEFAULT 0  -- cached, updated by trigger
);

CREATE INDEX idx_challenges_slug ON challenges(slug);
CREATE INDEX idx_challenges_host ON challenges(host_user_id);

-- Link participant boards to the challenge they joined
ALTER TABLE boards ADD COLUMN challenge_id UUID REFERENCES challenges(id) ON DELETE SET NULL;
CREATE INDEX idx_boards_challenge_id ON boards(challenge_id);
```

**RLS for `challenges`:**

```sql
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Anyone can view challenges
CREATE POLICY "Challenges are publicly viewable"
  ON challenges FOR SELECT
  USING (TRUE);

-- Only the host can create/update/delete their challenge
CREATE POLICY "Hosts manage their own challenges"
  ON challenges FOR ALL
  USING (host_user_id = auth.uid())
  WITH CHECK (host_user_id = auth.uid());
```

**Leaderboard query** (no new table needed — derived from existing data):

```sql
SELECT
  b.user_id,
  COUNT(*) FILTER (WHERE g.completed = TRUE) AS completed_count,
  COUNT(*) AS total_count
FROM boards b
JOIN goals g ON g.board_id = b.id
WHERE b.challenge_id = $1
GROUP BY b.user_id
ORDER BY completed_count DESC
LIMIT 50;
```

### Routes

**`src/routes/challenge/[slug]/+page.svelte`** — challenge landing page
- Shows challenge name, description, goal list (read-only from source board)
- Leaderboard: top 10 completers (anonymized by default — show username if they
  have a creator profile, otherwise "Anonymous")
- Participant count
- "Join challenge" button → triggers clone + links to challenge

**`src/routes/challenge/[slug]/join/+page.svelte`**
- Handles the clone flow: creates a copy of the source board, sets `challenge_id`
- If anonymous: sign in first, then clone
- Redirects to the user's new board

### New components

**`ChallengeLeaderboard.svelte`**
- List of top participants with completion percentage
- Updates in real-time if using Supabase realtime, or on page load

**`CreateChallengeModal.svelte`**
- Board owner opens this from board settings
- Fields: challenge name, slug (auto-generated from name, editable), description
- "Publish challenge" → creates the record, redirects to the challenge page to share

**`JoinedChallengeBadge.svelte`**
- Small indicator on the board view when the board is part of a challenge
- "View challenge" link → goes to the challenge leaderboard

### Slug generation

Auto-generate from board name: `"Read 25 Books 2026"` → `"read-25-books-2026"`.
Validate uniqueness. If taken, append a random 4-char suffix.

---

## Social 6: Creator Profiles

### What it does

A public page at `/@username` showing all of a user's public boards. Natural
landing page for TikTok creators to send their audience. Also provides a
browsable surface for discovery.

### Requires

Social 1 (public board links).

### DB changes

```sql
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(30) UNIQUE NOT NULL,  -- URL-safe, letters/numbers/hyphens
  display_name VARCHAR(100),
  bio VARCHAR(280),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_user_profiles_username ON user_profiles(LOWER(username));
```

**RLS:**

```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view profiles
CREATE POLICY "Profiles are public"
  ON user_profiles FOR SELECT
  USING (TRUE);

-- Users can manage their own profile
CREATE POLICY "Users manage their own profile"
  ON user_profiles FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### Routes

**`src/routes/@[username]/+page.svelte`** — creator profile
- Loads the user profile by username
- Loads all public boards for that user
- Shows: display name, bio, grid of public boards (click → public board view)
- "Create your own" CTA

**SvelteKit note:** `@` in route params requires the folder name `[username]` and
the URL path `/@username`. SvelteKit handles this correctly as a named param;
just verify the route resolves properly vs. other `@`-prefixed paths.

### New components

**`ProfileSetupModal.svelte`**
- Triggered when a user first makes a board public (if they don't have a profile yet)
- "Choose a username to get a profile page for your boards"
- Username field with availability check (debounced)
- Optional: display name
- Can be skipped — board is made public without a profile

**`PublicBoardGrid.svelte`**
- Grid of `PublicBoardCard.svelte` components (simplified BoardCard for public view)
- Shows board name, completion percentage, size

### Store changes

**New `profileStore`**
- `fetchProfile(username)` — load profile + public boards
- `createProfile(username, displayName)` — create the profile record
- `updateProfile(displayName, bio)` — update

### Integration

In `boardsStore.makePublic()`: after making a board public, check if the user
has a profile. If not, dispatch an event that triggers `ProfileSetupModal`.

---

## Social 7: Monthly Recap Images

### What it does

Generate a "Month in review" style shareable image showing progress for a given
calendar month. Prompt the user to re-share on the first visit of each new month.

### Requires

Share-as-Image (Feature 2 of the TikTok spec).

### No DB changes

Track "has been prompted for month X on board Y" in localStorage:
`bingo_recap_shown_{boardId}_{year}_{month}` → `true`

For the image content, all needed data is already in the `Board` type
(completion status, `completedAt` timestamps on goals).

### New components

**`ExportableRecap.svelte`**
- Hidden, fixed-size (1080x1080px)
- Content:
  - Month name + year as headline
  - Board title
  - Goals completed this month (filtered by `completedAt` within the month range)
  - Running total: "X/Y goals completed overall"
  - Mini-grid showing overall completion state
  - App watermark

**`RecapPrompt.svelte`**
- Non-blocking toast or slide-up that appears on first board visit in a new month
- "Share your [Month] progress?"
- "Share" → generates and shares the recap image
- "Not now" → dismisses, marks as shown

### Utility changes

**`src/lib/utils/export.ts`**
- Add `generateRecapImage(board, year, month)` — renders `ExportableRecap` and
  returns image blob

### Integration

In `BingoBoard.svelte` (or the board page's `onMount`): on load, check if it's
a new month since the last recap prompt for this board. If yes, show
`RecapPrompt`.

---

## Social 8: Board Completion Certificate

### What it does

When the last goal on a board is checked, trigger a full-screen celebration with
a shareable "I completed my 2026 bingo board" certificate image. Rare enough to
feel meaningful.

### Requires

Share-as-Image (Feature 2 of the TikTok spec).

### No DB changes

Track in localStorage: `bingo_completion_cert_shown_{boardId}` → `true`

### New components

**`CompletionCelebration.svelte`**
- Full-screen overlay (not a modal — this is a big moment)
- Confetti animation (can use a lightweight library like `canvas-confetti`)
- Certificate preview
- "Share this moment" button
- "Close" to dismiss

**`ExportableCompletionCert.svelte`**
- Hidden, fixed-size (1080x1080px or 1080x1920px for stories)
- Content:
  - "COMPLETE" or "I DID IT" as the headline
  - Board title + year
  - Full board grid (all goals checked)
  - Date completed
  - App watermark
- Styling should feel like a real certificate — gold border, distinguished font,
  different from the regular board export

### Integration

In `BingoBoard.svelte` (or wherever goal completion is processed): after any
goal toggle, check if all goals are now complete AND the cert hasn't been shown
for this board. If yes, trigger `CompletionCelebration`.

Note: the bingo detection (`detectBingo`) already runs after every toggle —
add a parallel `isFullyComplete` check.

---

## DB Migration Summary

Here's every schema change across all features, in the order they'd need to be
applied:

```sql
-- Social 1: Public Board Links
ALTER TABLE boards ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT FALSE;

-- Social 4: Accountability Partners
CREATE TABLE board_followers (...);
CREATE TABLE board_reactions (...);

-- Social 5: Group Challenges
CREATE TABLE challenges (...);
ALTER TABLE boards ADD COLUMN challenge_id UUID REFERENCES challenges(id);

-- Social 6: Creator Profiles
CREATE TABLE user_profiles (...);
```

Features 2, 3, 7, 8 require no DB changes.

---

## What NOT to build yet

**Public gallery / discovery feed:** Needs volume before it's useful, creates
moderation burden, and can be derived from existing public boards later. Skip.

**Push notifications:** The spec lists these as out of scope. Email notifications
for accountability partners (Social 4, Phase 2) is the closest equivalent and
should be a separate implementation step.

**Video/animated export:** Mentioned in the share-as-image spec open questions.
Not a priority until static sharing is proven to work.
