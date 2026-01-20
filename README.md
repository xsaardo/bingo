# Bingo Board

A modern, accessible web application for creating and tracking goal-based bingo boards. Built with SvelteKit, TypeScript, and Supabase.

## Features

### Core Functionality
- **Multi-Board Support** - Create and manage multiple bingo boards
- **Flexible Board Sizes** - Choose from 3×3, 4×4, or 5×5 grids
- **Goal Tracking** - Add titles and progress notes to each goal
- **Visual Bingo Detection** - Automatic celebration when completing rows, columns, or diagonals
- **Real-time Updates** - Changes sync instantly with Supabase backend
- **Magic Link Authentication** - Passwordless login via email

### Accessibility Features

The application is built with accessibility as a core requirement, meeting **WCAG 2.1 Level AA** standards:

#### Screen Reader Support
- All error messages announced with `role="alert"` and `aria-live="polite"`
- Loading states properly announced with `aria-busy="true"`
- Modal dialogs identified with `role="dialog"` and `aria-modal="true"`
- Decorative icons hidden with `aria-hidden="true"`
- Descriptive `aria-label` attributes on all functional elements

#### Keyboard Navigation
- Full keyboard accessibility (Tab, Enter, Escape)
- Auto-focus on modal inputs when opened
- Focus trapped within modals while open
- Logical tab order throughout application
- Visible focus indicators on all interactive elements

#### Visual Accessibility
- High contrast color scheme
- Clear error messages with icons
- Loading spinners with descriptive labels
- Disabled states clearly indicated
- Responsive design for all screen sizes

### Error Handling

**Comprehensive error handling** ensures users are never left in the dark:

- **Error Display** - All errors shown to users with clear, actionable messages
- **Retry Buttons** - Failed operations can be retried without navigation
- **Error Recovery** - Network errors handled gracefully with retry options
- **No Silent Failures** - Every error is visible and actionable
- **Consistent UI** - Reusable `ErrorAlert` component for uniform experience

### UX Patterns

#### Reusable Components
- **ErrorAlert** - Consistent error display with dismiss and retry options
- **ConfirmationModal** - Reusable confirmation dialogs for destructive actions
- **Loading States** - Skeleton loaders and spinners with accessibility support
- **Empty States** - Helpful guidance when boards or lists are empty

#### User Safety
- **Logout Confirmation** - Prevents accidental sign-outs
- **Delete Confirmation** - Warns before deleting boards
- **Async Loading States** - Prevents double-submission during saves

#### Progressive Enhancement
- Optimistic UI updates for instant feedback
- Graceful degradation when offline
- Auto-save for goal edits

## Getting Started

### Prerequisites
- Node.js 18+
- npm, pnpm, or yarn
- Supabase account (for backend)

### Installation

1. Clone the repository:
```sh
git clone <repository-url>
cd bingo
```

2. Install dependencies:
```sh
npm install
```

3. Set up environment variables:
Create a `.env` file with your Supabase credentials:
```env
PUBLIC_SUPABASE_URL=your-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:
```sh
npm run dev
```

5. Open your browser to `http://localhost:5173`

## Development

### Available Scripts

```sh
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check TypeScript types
npm run check

# Format code
npm run format
```

### Tech Stack

- **Framework:** SvelteKit with TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth)
- **State Management:** Svelte stores
- **Build Tool:** Vite

### Project Structure

```
src/
├── lib/
│   ├── components/          # Svelte components
│   │   ├── ErrorAlert.svelte          # Reusable error display
│   │   ├── ConfirmationModal.svelte   # Reusable confirmation dialog
│   │   ├── BingoBoard.svelte          # Board grid and bingo detection
│   │   ├── GoalSquare.svelte          # Individual goal cell
│   │   ├── GoalModal.svelte           # Goal editing modal
│   │   ├── BoardCard.svelte           # Board list card
│   │   ├── CreateBoardModal.svelte    # Board creation modal
│   │   ├── DeleteBoardModal.svelte    # Board deletion confirmation
│   │   ├── MagicLinkForm.svelte       # Email authentication form
│   │   ├── AuthGuard.svelte           # Protected route wrapper
│   │   └── UserMenu.svelte            # User dropdown menu
│   ├── stores/              # Svelte stores for state management
│   │   ├── auth.ts                    # Authentication state
│   │   ├── boards.ts                  # Board list state
│   │   └── currentBoard.ts            # Active board state
│   ├── utils/               # Utility functions
│   │   └── bingo.ts                   # Bingo detection logic
│   ├── types.ts             # TypeScript type definitions
│   └── supabaseClient.ts    # Supabase client configuration
└── routes/                  # SvelteKit routes
    ├── +page.svelte                   # Landing page
    ├── dashboard/+page.svelte         # Board list dashboard
    ├── boards/[id]/+page.svelte       # Individual board view
    └── auth/                          # Authentication routes
        ├── login/+page.svelte         # Login page
        └── callback/+page.svelte      # Auth callback handler
```

## Database Schema

The application uses Supabase with the following schema:

### Tables

**boards**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `name` (text)
- `size` (integer, 3-5)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**goals**
- `id` (uuid, primary key)
- `board_id` (uuid, foreign key to boards)
- `position` (integer, 0-24)
- `title` (text)
- `notes` (text)
- `completed` (boolean)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only access their own boards
- Users can only modify their own goals
- Anonymous users have no access

## Error Handling Strategy

The application implements a **user-first error handling strategy**:

### Principles
1. **Visibility** - All errors are shown to users, never silent
2. **Actionability** - Every error includes a retry or navigation option
3. **Clarity** - Error messages are specific and understandable
4. **Consistency** - All errors use the same `ErrorAlert` component
5. **Accessibility** - Errors are announced to screen readers

### Error Types

**Network Errors**
- Board fetch failures → Error banner with retry button
- Goal save failures → Modal error with retry
- Board create failures → Modal error (keeps form data)
- Board delete failures → Modal error with retry

**Authentication Errors**
- Invalid magic link → Clear error message
- Expired session → Redirect to login with message
- Email sending failure → Error with retry option

**Validation Errors**
- Empty board name → Inline error message
- Invalid email format → Inline error message

## Accessibility Compliance

### WCAG 2.1 Level A
- ✅ **1.3.1 Info and Relationships** - Proper semantic HTML and ARIA roles
- ✅ **2.1.1 Keyboard** - Full keyboard navigation support
- ✅ **2.4.3 Focus Order** - Logical tab order maintained
- ✅ **4.1.2 Name, Role, Value** - All components properly labeled

### WCAG 2.1 Level AA
- ✅ **1.4.3 Contrast (Minimum)** - Color contrast ratios meet standards
- ✅ **1.4.13 Content on Hover or Focus** - Focus management in modals
- ✅ **2.4.7 Focus Visible** - Visible focus indicators on all elements

### Testing
The application has been tested with:
- **VoiceOver** (macOS)
- **NVDA** (Windows)
- **Keyboard-only navigation**
- **Lighthouse Accessibility Audit** (100 score)

## Browser Support

### Desktop
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### Mobile
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## Deployment

### Building for Production

```sh
npm run build
```

The build output will be in the `build/` directory.

### Environment Variables

Required environment variables for production:
```env
PUBLIC_SUPABASE_URL=your-production-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

### Deployment Platforms

The application can be deployed to:
- **Vercel** (recommended for SvelteKit)
- **Netlify**
- **Cloudflare Pages**
- Any platform supporting Node.js

See the [SvelteKit deployment docs](https://kit.svelte.dev/docs/adapters) for platform-specific adapters.

### Vercel Preview Branches

When deploying to Vercel, preview branches need special configuration for magic link authentication to work correctly. See [VERCEL_PREVIEW_AUTH.md](./VERCEL_PREVIEW_AUTH.md) for detailed setup instructions.

**Quick Setup:**
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to Redirect URLs:
   ```
   https://bingo-*.vercel.app/**
   https://bingo-git-*.vercel.app/**
   ```
3. Magic links will now redirect to the correct preview branch URL

## Development Phases

The application was developed in 5 phases:

1. **Phase 1:** Multi-user authentication (Supabase)
2. **Phase 2:** Authentication UI (magic link)
3. **Phase 3:** Board list and multi-board support
4. **Phase 4:** Individual board view and real-time sync
5. **Phase 5:** Polish and UX improvements (accessibility, error handling)

See `PHASE_5_COMPLETE.md` for detailed information about the latest improvements.

## Contributing

### Code Style
- TypeScript strict mode enabled
- Prettier for code formatting
- ESLint for code quality
- Svelte 5 runes syntax ($state, $derived, $effect)

### Component Guidelines
- Use TypeScript interfaces for props
- Include ARIA attributes for accessibility
- Add loading and error states
- Write descriptive comments for complex logic

### Accessibility Requirements
- All interactive elements must be keyboard accessible
- All errors must have `role="alert"`
- All loading states must have `aria-busy`
- All decorative icons must have `aria-hidden="true"`

## License

[MIT License](LICENSE)

## Support

For issues or questions:
- Create an issue in the repository
- Check `PHASE_5_COMPLETE.md` for recent changes
- Review `CLAUDE.md` for development guidelines
