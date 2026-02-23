# BINGOAL

A web application for turning your goals into a bingo board. Built with SvelteKit, TypeScript, and Supabase.

## Features

### Core Functionality

- **No Sign-Up Required** - Create a board instantly; sign up later to unlock advanced features
- **5×5 Goal Boards** - One board size, focused on depth over configuration
- **Goal Tracking** - Add titles, rich text progress notes, and milestones to each goal
- **Visual Bingo Detection** - Confetti celebration when completing rows, columns, or diagonals
- **Real-time Updates** - Changes sync instantly with Supabase backend
- **Magic Link Authentication** - Passwordless login via email

### Goal Details (Signed-In Users)

- **Rich Text Notes** - Format progress notes with bold, lists, links, and more
- **Milestones** - Break goals into trackable sub-tasks
- **Date Metadata** - Automatic tracking of when a goal was started, completed, and last updated

### Multi-Board Support (Signed-In Users)

- **Dashboard** - View and manage all your boards in one place
- **Multiple Boards** - Create as many boards as you need

### Accessibility Features

The application meets **WCAG 2.1 Level AA** standards:

- Screen reader support with proper ARIA roles and live regions
- Full keyboard navigation (Tab, Enter, Escape)
- Auto-focus and focus trapping in modals
- Visible focus indicators on all interactive elements
- High contrast color scheme

### Error Handling

- All errors shown to users with clear, actionable messages
- Retry buttons for failed operations
- No silent failures

## Getting Started

### Prerequisites

- Node.js 18+
- npm
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
- **Rich Text:** TipTap
- **Build Tool:** Vite

### Project Structure

```
src/
├── lib/
│   ├── components/          # Svelte components
│   │   ├── AuthGuard.svelte           # Protected route wrapper
│   │   ├── BingoBoard.svelte          # Board grid and bingo detection
│   │   ├── BoardCard.svelte           # Board list card
│   │   ├── BoardSizeSelector.svelte   # Size selection UI
│   │   ├── CheckboxButton.svelte      # Reusable checkbox
│   │   ├── Confetti.svelte            # Bingo celebration animation
│   │   ├── ConfirmationModal.svelte   # Reusable confirmation dialog
│   │   ├── ConversionPrompt.svelte    # Sign-up prompt for anonymous users
│   │   ├── CreateBoardModal.svelte    # Board creation modal
│   │   ├── DateMetadata.svelte        # Goal date tracking display
│   │   ├── DeleteBoardModal.svelte    # Board deletion confirmation
│   │   ├── DragHandle.svelte          # Drag handle for reordering
│   │   ├── ErrorAlert.svelte          # Reusable error display
│   │   ├── GoalModal.svelte           # Goal editing modal
│   │   ├── GoalSquare.svelte          # Individual goal cell
│   │   ├── Logo.svelte                # App logo
│   │   ├── MagicLinkForm.svelte       # Email authentication form
│   │   ├── MilestoneItem.svelte       # Single milestone row
│   │   ├── MilestoneList.svelte       # Goal milestone list
│   │   ├── RichTextEditor.svelte      # TipTap rich text editor
│   │   └── UserMenu.svelte            # User dropdown menu
│   ├── stores/              # Svelte stores for state management
│   │   ├── auth.ts                    # Authentication state
│   │   ├── board.ts                   # UI state (selected goal, etc.)
│   │   ├── boards.ts                  # Board list state
│   │   └── currentBoard.ts            # Active board state
│   ├── utils/               # Utility functions
│   │   ├── auth.ts                    # Authentication helpers
│   │   ├── bingo.ts                   # Bingo detection logic
│   │   └── storage.ts                 # Local storage utilities
│   ├── types.ts             # TypeScript type definitions
│   └── supabaseClient.ts    # Supabase client configuration
└── routes/                  # SvelteKit routes
    ├── +page.svelte                   # Landing page / board creation
    ├── dashboard/+page.svelte         # Board list dashboard
    ├── boards/[id]/+page.svelte       # Individual board view
    └── auth/                          # Authentication routes
        ├── login/+page.svelte         # Login page
        ├── logout/+page.svelte        # Logout handler
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
- `position` (integer, 0-indexed)
- `title` (text)
- `notes` (text, rich text HTML)
- `completed` (boolean)
- `started_at` (timestamp, auto-set on first edit)
- `completed_at` (timestamp, auto-set when marked complete)
- `updated_at` (timestamp)
- `milestones` (jsonb, array of milestone objects)

### Row Level Security (RLS)

All tables have RLS enabled — users can only access and modify their own data. Anonymous users can access boards created in their session.

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

When deploying to Vercel, preview branches need special configuration for magic link authentication to work correctly.

**Quick Setup:**

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to Redirect URLs:
   ```
   https://bingo-*.vercel.app/**
   https://bingo-git-*.vercel.app/**
   ```
3. Magic links will now redirect to the correct preview branch URL

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

### Accessibility Requirements

- All interactive elements must be keyboard accessible
- All errors must have `role="alert"`
- All loading states must have `aria-busy`
- All decorative icons must have `aria-hidden="true"`

## License

[MIT License](LICENSE)

## Support

For issues or questions, create an issue in the repository.
