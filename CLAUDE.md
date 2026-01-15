# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check TypeScript types
npm run check
```

## Architecture

### Tech Stack
- **Framework:** SvelteKit (with TypeScript)
- **Styling:** Tailwind CSS
- **State Management:** Svelte stores
- **Data Persistence:** LocalStorage (client-side only)

### Project Structure
```
src/
├── lib/
│   ├── components/     # Svelte components
│   │   ├── BoardSizeSelector.svelte
│   │   ├── BingoBoard.svelte
│   │   ├── GoalSquare.svelte
│   │   └── GoalModal.svelte
│   ├── stores/         # Svelte stores for state management
│   │   └── board.ts
│   ├── utils/          # Utility functions
│   │   ├── storage.ts  # LocalStorage utilities
│   │   └── bingo.ts    # Bingo detection logic
│   └── types.ts        # TypeScript type definitions
└── routes/
    └── +page.svelte    # Main page
```

### Data Model
The app uses a single Board structure containing all goals:
- Board has a size (3, 4, or 5)
- Each goal has: id, title, notes, and completed status
- Bingo detection checks rows, columns, and diagonals

### Key Features
- Single board mode (one board at a time)
- Customizable board size (3x3, 4x4, 5x5)
- Visual feedback for completed bingo lines
- Auto-save to LocalStorage
