# New Year Goals Bingo - Specifications

## Overview

A web app that allows users to create and track their new year goals using an interactive bingo board format.

## Confirmed Architecture Decisions

### Tech Stack

- **Framework:** SvelteKit
- **Styling:** Tailwind CSS
- **Data Persistence:** LocalStorage (client-side only)
- **Build Tool:** Vite (bundled with SvelteKit)

### Core Features

1. **Customizable board size** - User can select board dimensions (e.g., 3x3, 4x4, 5x5)
2. **Goal input** - Each square can have a goal title
3. **Progress notes** - Each square supports notes for tracking progress
4. **Completion marking** - Visual toggle to mark goals as complete
5. **Persistence** - Board state saved to LocalStorage

## Data Model

```typescript
interface Goal {
	id: string;
	title: string;
	notes: string;
	completed: boolean;
}

interface Board {
	id: string;
	name: string;
	size: number; // e.g., 3 for 3x3, 5 for 5x5
	goals: Goal[]; // length = size * size
	createdAt: string;
	updatedAt: string;
}
```

## UI/UX Requirements

- Modern, minimal aesthetic
- Responsive design (mobile-friendly)
- Clear visual distinction between completed and incomplete goals

## Design Decisions

- **Single board mode** - One board at a time per user
- **Bingo detection** - Visual feedback when a row, column, or diagonal is completed
- **Light mode only** - No dark mode for initial version
- **Board sizes** - 3x3, 4x4, or 5x5 (fixed options)

## Testing Strategy

- **Unit Tests:** Vitest for logic (bingo detection, LocalStorage utilities)
- **E2E Tests:** Playwright for user flow testing
- **Agent Iteration:** Playwright MCP for visual verification during development

## Implementation Plan

### Phase 0: Environment Setup

- [ ] Install Playwright MCP for Claude Code (`claude mcp add playwright npx '@playwright/mcp@latest'`)
- [ ] Initialize SvelteKit project
- [ ] Configure Tailwind CSS
- [ ] Set up project structure

### Phase 1: Core Components

- [ ] `BoardSizeSelector` - Choose 3x3, 4x4, or 5x5
- [ ] `BingoBoard` - Grid layout displaying all squares
- [ ] `GoalSquare` - Individual square with goal display
- [ ] `GoalModal` - Edit goal title and notes

### Phase 2: State & Persistence

- [ ] Svelte store for board state
- [ ] LocalStorage save/load utilities
- [ ] Auto-save on changes

### Phase 3: Bingo Detection & Feedback

- [ ] Logic to detect completed rows/columns/diagonals
- [ ] Visual celebration (animation, highlight winning line)

### Phase 4: Polish & Testing

- [ ] Responsive layout
- [ ] Transitions and micro-interactions
- [ ] Empty states and onboarding
- [ ] E2E tests with Playwright
