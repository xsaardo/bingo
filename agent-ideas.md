# Agent-Native Ideas for Bingo App

Brainstormed applications of agent-native architecture principles to the goal-tracking bingo app.

---

## Atomic Tool Set

Every UI action needs an agent equivalent (parity principle). No workflow-shaped tools — those are outcomes, not primitives.

| Tool | Description |
| ---- | ----------- |
| `list_boards()` | Returns all boards with name, size, completion % |
| `create_board(name, size)` | Creates a new board |
| `get_board(id)` | Returns goals with positions and completion state |
| `add_goal(board_id, position, title, notes?)` | Adds a goal at a specific grid position |
| `update_goal(goal_id, title?, notes?, completed?)` | Updates any goal field |
| `delete_goal(goal_id)` | Removes a goal |
| `check_bingo(board_id)` | Returns which rows/cols/diagonals are complete |

These primitives unlock emergent behavior. `organize_board_by_theme()` is not a tool — it's a prompt.

---

## Emergent Capabilities (No New Features Required)

With the primitives above, an agent could handle things never explicitly built:

- **"Help me fill a 5x5 board for learning Spanish"** — agent calls `create_board`, then 25x `add_goal` with generated content
- **"Move my fitness goals so they form a row"** — agent reads positions, reasons about layout, updates each goal
- **"I finished my workout — mark all exercise goals complete"** — agent fuzzy-matches goal titles, marks each complete
- **"Which board am I closest to winning?"** — agent calls `check_bingo` on each board, compares results
- **"Rewrite my vague goals to be more specific"** — agent reads, rewrites, calls `update_goal` per goal

---

## Context Injection (System Prompt at Session Start)

Prevents the agent from asking "what boards do you have?" every time.

```
## Your boards
- "2026 Fitness" (5x5) — 12/25 goals complete, 1 bingo on row 3
- "Q1 Work Goals" (3x3) — 4/9 complete, no bingo yet

## Recent activity
- Completed "Run 5k" 2 days ago
- Created "Q1 Work Goals" board last week
```

---

## Specific Feature Ideas

### 1. Board Population from Freeform Text

User types unstructured intent: *"I want to read more, exercise 3x/week, call my parents, learn to cook..."*

Agent parses intent, distributes goals across the grid, and calls `add_goal` for each. No form filling required.

**Why this matters:** Creating a full 25-goal board is tedious and likely discourages users from choosing larger sizes. This removes that friction entirely.

### 2. Strategic Goal Placement

The bingo mechanic is underused as a *design* tool. An agent could reason: "Put your 5 most-likely goals in one row so you'll get a bingo early and stay motivated." A human would never do this manually — an agent naturally reasons about it.

Prompt: *"Rearrange my board so I'm most likely to get a bingo soon."*
Agent reads completion state, reasons about probability, calls `update_goal` with new positions.

### 3. Cross-Board Pattern Recognition

With `list_boards` + `get_board` in a loop, the agent can surface insights the UI never shows:

- "You complete goals in your personal boards but almost nothing in your work board."
- "Your 3x3 boards get finished; your 5x5 boards stall after the first row."
- "You haven't touched the 'Career' board in 3 weeks."

### 4. Goal Health Review

Agent reads all incomplete goals, flags ones that are vague or unmeasurable, and suggests rewrites. User approves each in conversation.

Example: *"Learn guitar"* → *"Practice guitar for 20 minutes, 3x per week"*

---

## What This Would Actually Require

1. **API layer** — `/api/agent` endpoint or Supabase edge functions exposing the atomic tools in Claude's tool-use API format
2. **Auth delegation** — agent tools act as the authenticated user; session token scoped per user
3. **Chat UI surface** — sidebar or modal where the user talks to the agent; tool calls reflect immediately in the board view
4. **Real-time reflection** — when agent calls `add_goal`, the board rerenders without a page refresh (Svelte stores already support this)

---

## Honest Priority

**Board population** is the highest-value unlock. The strategic placement idea is the most novel — it's something a human designer wouldn't think to do but an agent naturally would. Cross-board insights require no new data, just a loop over existing API calls.
