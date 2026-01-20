# Multi-User Board Persistence - Implementation Plan

## Overview
Transform the Bingo app from single-user localStorage-based to multi-user server-backed persistence with frictionless email authentication.

---

## Technology Stack Recommendations

### Backend Options (Pick One)

#### Option A: Supabase (Recommended - Most Frictionless)
**Pros:**
- Built-in authentication (magic links, email/password)
- PostgreSQL database included
- Real-time subscriptions out of the box
- Row-level security (RLS) for data isolation
- Free tier generous for small projects
- Minimal backend code needed

**Cons:**
- Vendor lock-in
- Need to learn Supabase SDK

#### Option B: Firebase/Firestore
**Pros:**
- Google authentication integration
- NoSQL flexibility
- Real-time updates built-in
- Good free tier

**Cons:**
- Different data model (document-based)
- Vendor lock-in

#### Option C: Custom Backend (Prisma + Auth.js)
**Pros:**
- Full control
- Any database (PostgreSQL, MySQL, SQLite)
- No vendor lock-in

**Cons:**
- More setup and maintenance
- Need to handle auth infrastructure
- More code to write

**RECOMMENDATION: Supabase** - Best balance of features, ease of use, and frictionless auth.

---

## Architecture Overview

### Current Architecture
```
┌─────────────┐
│   Browser   │
│  (Svelte)   │
│             │
│ localStorage│
└─────────────┘
```

### Target Architecture
```
┌─────────────┐
│   Browser   │
│  (Svelte)   │
└──────┬──────┘
       │
       │ HTTP/WebSocket
       │
┌──────▼──────┐
│  Backend    │
│  (Supabase/ │
│   Custom)   │
└──────┬──────┘
       │
┌──────▼──────┐
│  Database   │
│ (PostgreSQL)│
└─────────────┘
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Boards Table
```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  size INTEGER NOT NULL CHECK (size IN (3, 4, 5)),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_boards (user_id, created_at DESC)
);
```

### Goals Table
```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- 0-24 for 5x5 board
  title VARCHAR(500) NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(board_id, position),
  INDEX idx_board_goals (board_id, position)
);
```

### Optional: Board Sharing (Future Enhancement)
```sql
CREATE TABLE board_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  shared_with_email VARCHAR(255) NOT NULL,
  permission VARCHAR(20) DEFAULT 'view', -- 'view' or 'edit'
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(board_id, shared_with_email)
);
```

---

## Authentication Strategy

### Frictionless Email Authentication Options

#### Option 1: Magic Link (Passwordless) - Most Frictionless ✨
**Flow:**
1. User enters email
2. System sends magic link to email
3. User clicks link
4. User is logged in

**Pros:**
- No password to remember
- No signup form needed
- Most frictionless UX

**Implementation (Supabase):**
```typescript
const { error } = await supabase.auth.signInWithOtp({
  email: userEmail,
  options: {
    emailRedirectTo: 'https://yourapp.com/auth/callback'
  }
});
```

#### Option 2: Email + Password with Auto-Login
**Flow:**
1. User enters email + creates password (6+ chars)
2. Auto-login after signup (no email verification required initially)
3. Optional: Send verification email in background

**Pros:**
- Traditional approach users understand
- Works offline after initial login

**Cons:**
- Requires password management
- Extra field in signup form

**RECOMMENDATION: Magic Link** - Truly frictionless, no passwords to manage.

---

## API Design

### REST Endpoints (if using custom backend)

#### Authentication
- `POST /api/auth/magic-link` - Send magic link
- `GET /api/auth/verify?token=xxx` - Verify magic link
- `POST /api/auth/logout` - Logout

#### Boards
- `GET /api/boards` - List user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get board with goals
- `PATCH /api/boards/:id` - Update board (name, size)
- `DELETE /api/boards/:id` - Delete board

#### Goals
- `PATCH /api/goals/:id` - Update goal (title, notes, completed)
- `POST /api/boards/:id/goals` - Create goal (if adding dynamically)

### Supabase API (if using Supabase)
No custom endpoints needed - use Supabase client:
```typescript
// Query boards
const { data } = await supabase
  .from('boards')
  .select('*, goals(*)')
  .order('created_at', { ascending: false });

// Update goal
await supabase
  .from('goals')
  .update({ completed: true })
  .eq('id', goalId);
```

---

## Frontend Changes

### 1. New Pages/Routes

```
routes/
├── +page.svelte                    # Landing/login page
├── +layout.svelte                  # Add auth layout
├── auth/
│   ├── login/+page.svelte         # Login form
│   ├── callback/+page.svelte      # OAuth/magic link callback
│   └── logout/+page.svelte        # Logout handler
├── dashboard/
│   ├── +page.svelte               # Board list (user's boards)
│   └── +layout.svelte             # Protected route layout
└── boards/
    └── [id]/+page.svelte          # Individual board view
```

### 2. Updated Store Architecture

#### `src/lib/stores/auth.ts` (New)
```typescript
interface User {
  id: string;
  email: string;
}

export const currentUser = writable<User | null>(null);
export const isAuthenticated = derived(currentUser, $user => !!$user);

export const authStore = {
  subscribe: currentUser.subscribe,

  async init() {
    // Check session on load
  },

  async sendMagicLink(email: string) {
    // Send magic link
  },

  async logout() {
    // Clear session
  }
};
```

#### `src/lib/stores/boards.ts` (New)
```typescript
interface BoardsState {
  boards: Board[];
  currentBoardId: string | null;
  loading: boolean;
}

export const boardsStore = {
  subscribe,

  async fetchBoards() {
    // Fetch user's boards from API
  },

  async createBoard(size: number, name: string) {
    // Create new board on server
  },

  async deleteBoard(id: string) {
    // Delete board
  },

  selectBoard(id: string) {
    // Set current board
  }
};
```

#### `src/lib/stores/currentBoard.ts` (Refactored from board.ts)
```typescript
export const currentBoard = writable<Board | null>(null);

export const currentBoardStore = {
  subscribe: currentBoard.subscribe,

  async load(boardId: string) {
    // Fetch board from API with goals
  },

  async updateGoal(goalId: string, updates: Partial<Goal>) {
    // Optimistic update + API call
  },

  async toggleComplete(goalId: string) {
    // Toggle completion
  },

  async saveGoal(goalId: string, data: Partial<Goal>) {
    // Save goal changes
  }
};
```

### 3. New Components

```
components/
├── Auth/
│   ├── MagicLinkForm.svelte       # Email input + submit
│   ├── AuthGuard.svelte           # Protect routes
│   └── UserMenu.svelte            # User dropdown (logout)
├── Boards/
│   ├── BoardList.svelte           # List of user's boards
│   ├── BoardCard.svelte           # Board preview card
│   ├── CreateBoardModal.svelte    # Create new board
│   └── DeleteBoardModal.svelte    # Confirm deletion
└── (existing components...)
```

### 4. Protected Routes Pattern

```typescript
// src/routes/dashboard/+layout.svelte
<script>
  import { goto } from '$app/navigation';
  import { isAuthenticated } from '$lib/stores/auth';
  import { onMount } from 'svelte';

  onMount(() => {
    if (!$isAuthenticated) {
      goto('/auth/login');
    }
  });
</script>

{#if $isAuthenticated}
  <slot />
{/if}
```

---

## Implementation Phases

### Phase 1: Backend Setup (Days 1-2)
**Goal:** Set up database and authentication

**Tasks:**
- [ ] Choose and set up backend (Supabase recommended)
- [ ] Create database schema (users, boards, goals tables)
- [ ] Set up Row Level Security (RLS) policies in Supabase
- [ ] Configure authentication (magic link)
- [ ] Test auth flow manually

**Deliverables:**
- Working database with tables
- Magic link authentication working
- RLS policies protecting user data

---

### Phase 2: Authentication UI (Days 3-4)
**Goal:** Build login/signup flow

**Tasks:**
- [ ] Create `auth.ts` store
- [ ] Build `MagicLinkForm.svelte` component
- [ ] Create `/auth/login` page
- [ ] Create `/auth/callback` page for magic link handling
- [ ] Add `UserMenu.svelte` with logout
- [ ] Implement session persistence
- [ ] Add auth guard for protected routes
- [ ] Test complete auth flow

**Deliverables:**
- Working login with magic link
- Protected routes that redirect if not authenticated
- User menu with logout

---

### Phase 3: Board List & Multi-Board Support (Days 5-6)
**Goal:** Allow users to create and switch between boards

**Tasks:**
- [ ] Create `boards.ts` store
- [ ] Build `/dashboard` page with board list
- [ ] Create `BoardCard.svelte` component
- [ ] Create `CreateBoardModal.svelte`
- [ ] Add "Create New Board" button
- [ ] Add board deletion functionality
- [ ] Implement board selection/navigation
- [ ] Update routing structure

**Deliverables:**
- Dashboard showing user's boards
- Ability to create multiple boards
- Ability to delete boards
- Navigation to individual boards

---

### Phase 4: Individual Board View & Real-time Sync (Days 7-8)
**Goal:** View and edit individual boards with server sync

**Tasks:**
- [ ] Create `/boards/[id]` route
- [ ] Refactor `currentBoard.ts` store to use API
- [ ] Update `BingoBoard.svelte` to work with server data
- [ ] Implement optimistic updates for goal edits
- [ ] Add conflict resolution for concurrent edits
- [ ] Handle offline mode gracefully
- [ ] Add loading states and error handling
- [ ] Test goal updates sync correctly

**Deliverables:**
- Individual board page working
- Goal edits save to server
- Smooth UX with optimistic updates
- Error handling for network issues

---

### Phase 5: Polish & UX Improvements (Days 9-10)
**Goal:** Polish the UX and add final touches

**Tasks:**
- [ ] Add loading skeletons for better UX
- [ ] Add empty states (no boards yet)
- [ ] Improve error messages
- [ ] Add confirmation dialogs for destructive actions
- [ ] Test complete user flows
- [ ] Update documentation

**Deliverables:**
- Polished UI with good loading/error states
- Clear error messaging
- Updated README with new features

---

### Phase 6 (Optional): Advanced Features
**Goal:** Enhance with additional features

**Tasks:**
- [ ] Board sharing via email
- [ ] Board templates
- [ ] Board export (JSON/PDF)
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Dark mode
- [ ] Mobile app (PWA)

---

## Security Considerations

### 1. Row-Level Security (RLS) - Supabase
```sql
-- Users can only see their own boards
CREATE POLICY "Users can view own boards"
  ON boards FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own boards
CREATE POLICY "Users can insert own boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own boards
CREATE POLICY "Users can update own boards"
  ON boards FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own boards
CREATE POLICY "Users can delete own boards"
  ON boards FOR DELETE
  USING (auth.uid() = user_id);

-- Similar policies for goals (via board ownership)
CREATE POLICY "Users can manage goals in own boards"
  ON goals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = goals.board_id
      AND boards.user_id = auth.uid()
    )
  );
```

### 2. Input Validation
- Validate board size (3, 4, or 5)
- Sanitize goal titles and notes (max length, no XSS)
- Rate limiting on board creation

### 3. Authentication Security
- Magic link tokens expire after 1 hour
- Tokens are single-use
- Secure HTTP-only cookies for session

---

## Performance Optimizations

### 1. Lazy Loading
- Only load board goals when viewing specific board
- Paginate board list if user has many boards

### 2. Caching
- Cache board list in store
- Invalidate on create/delete

### 3. Optimistic Updates
- Update UI immediately
- Rollback on error
- Show subtle saving indicator

### 4. Real-time Updates (Optional)
- Use Supabase Realtime for collaborative boards
- Show when other users are viewing same board

---

## Testing Strategy

### Unit Tests
- Store logic (auth, boards, currentBoard)
- Utility functions (bingo detection)
- Component logic

### Integration Tests
- Auth flow (login, logout)
- Board CRUD operations
- Goal updates

### E2E Tests (Playwright)
- Complete user journey: login → create board → edit goals → logout
- Multi-board management

---

## Rollback Plan

### If Issues Arise
1. Add feature flag: `USE_SERVER_STORAGE` to disable new features
2. Allow users to export data as JSON
3. Maintain database backups for 30 days

---

## Deployment Considerations

### Environment Variables
```bash
# .env
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (server-side only)
```

### Build Configuration
- Update `svelte.config.js` if using adapter-auto
- Configure CORS for API calls
- Set up environment-specific configs (dev/staging/prod)

### Database Migrations
- Use Supabase migrations or Prisma migrate
- Version control schema changes
- Test migrations on staging first

---

## Timeline Estimate

**Total: 8-10 days**

- Phase 1: Backend Setup (2 days)
- Phase 2: Auth UI (2 days)
- Phase 3: Board List (2 days)
- Phase 4: Board View (2 days)
- Phase 5: Polish & UX (1-2 days)
- Buffer for testing and fixes (1-2 days)

---

## Success Metrics

### User Experience
- [ ] Login in < 30 seconds (including email check)
- [ ] Board loads in < 1 second
- [ ] Goal updates feel instant (optimistic)
- [ ] No data loss

### Technical
- [ ] < 100ms API response time for board list
- [ ] < 200ms API response time for goal updates
- [ ] Zero auth security vulnerabilities

---

## Questions to Resolve

1. **Board naming:** Default names vs. required names?
2. **Board limit:** Max boards per user (for free tier)?
3. **Data retention:** How long to keep deleted boards (soft delete)?
4. **Analytics:** Track usage metrics? (board creations, goal completions)
5. **Email provider:** Which email service for magic links? (SendGrid, Postmark, Supabase built-in)

---

## Next Steps

1. **Review this plan** and provide feedback
2. **Choose backend option** (Supabase recommended)
3. **Set up development environment** (create Supabase project or set up custom backend)
4. **Begin Phase 1** implementation

---

## Notes

- This plan prioritizes **speed and simplicity** over perfect architecture
- Magic links provide the most frictionless UX
- Supabase dramatically reduces implementation time
- Can always refactor to custom backend later if needed

**Estimated Total Implementation Time: 8-10 development days**
