# Playwright Testing Standards

> **Purpose:** Reference guide for writing and reviewing Playwright E2E tests in this repo.
> Captures best-practice research and a concrete analysis of existing flakiness patterns.
> See [#101](https://github.com/xsaardo/bingo/issues/101) for background.

---

## Table of Contents

1. [Best Practices](#best-practices)
2. [Anti-Patterns with Before/After Examples](#anti-patterns-with-beforeafter-examples)
3. [Existing Test Audit](#existing-test-audit)
4. [Action Checklist](#action-checklist)

---

## Best Practices

### 1. Never use `waitForTimeout` / arbitrary sleeps

Arbitrary sleeps are the single biggest cause of flaky tests. They either wait too long (slow CI) or not long enough (fast machines). Always wait for a concrete observable condition instead.

| Instead of | Use |
|---|---|
| `page.waitForTimeout(1000)` | `await expect(locator).toBeVisible()` |
| `page.waitForTimeout(500)` | `await page.waitForResponse(...)` |
| `page.waitForTimeout(2000)` | `await locator.waitFor({ state: 'visible' })` |

### 2. Prefer semantic locators

Playwright's locators are ranked by resilience. Use the highest-priority locator available:

```
getByRole        ← most resilient, matches accessible semantics
getByLabel       ← great for form fields
getByPlaceholder ← useful when no label
getByText        ← for visible text content
getByTestId      ← explicit, stable, good fallback
locator('css')   ← last resort only
```

Avoid locators that couple tests to implementation details (class names, DOM structure).

### 3. Use web-first assertions (`expect(locator)`)

Web-first assertions auto-retry until the condition is met (up to the configured timeout). Imperative waits do not.

```ts
// ✅ Web-first — retries automatically
await expect(page.getByTestId('goal-modal')).toBeVisible();

// ❌ Imperative — race condition
await page.waitForSelector('[data-testid="goal-modal"]');
```

### 4. Avoid fragile DOM traversal

Parent traversal with `.locator('..')` breaks whenever the DOM structure changes. Use `data-testid` attributes on the element you actually need.

```ts
// ❌ Fragile — tied to DOM nesting
const container = milestone.locator('..');

// ✅ Stable — explicit testid on the target
const container = page.getByTestId('milestone-row');
```

### 5. Avoid asserting on CSS class names for behavior

CSS classes are styling details. Use ARIA state, visible text, or `data-*` attributes to assert behavior.

```ts
// ❌ Fragile — class name can change with a refactor
await expect(checkbox).toHaveClass(/bg-blue-500/);

// ✅ Semantic — describes user-visible state
await expect(checkbox).toBeChecked();
await expect(milestone).toHaveAttribute('data-completed', 'true');
```

### 6. Don't share mutable state across tests at module scope

Module-level variables survive between tests in the same worker. If one test fails before cleanup, the next test starts with dirty state.

```ts
// ❌ Module-level shared state
let createdBoardId: string | null = null;

// ✅ Local to each test via beforeEach
test.describe('Board creation', () => {
  let boardId: string;
  test.beforeEach(async ({ page }) => {
    boardId = await createTestBoard(page);
  });
  test.afterEach(async ({ page }) => {
    await deleteTestBoard(page, boardId);
  });
});
```

### 7. Use `waitForResponse` to gate assertions on async mutations

After any action that triggers a network write, wait for the response before asserting on the result. Otherwise the assertion may run before the server has processed the change.

```ts
// ✅ Gate on the network response
const saveRequest = page.waitForResponse(
  (resp) => resp.url().includes('/goals') && resp.request().method() === 'PATCH',
  { timeout: 5000 }
);
await page.getByTestId('save-goal-button').click();
await saveRequest;

// Then assert
const goal = await getGoalData(page, goalId, 'title');
expect(goal.title).toBe('My Goal');
```

### 8. Register console error listeners before any actions

`page.on('console', ...)` only captures events that fire *after* the listener is registered. Register at the very start of the test — ideally in a fixture or at the top of `beforeEach` — not after navigating or clicking.

```ts
// ❌ Too late — may miss errors from setup actions
createdBoardId = await createBoardWithSize(page);
const consoleErrors: string[] = [];
page.on('console', (msg) => { ... });

// ✅ Register first
const consoleErrors: string[] = [];
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
createdBoardId = await createBoardWithSize(page);
```

### 9. Use `pressSequentially()` instead of deprecated `editor.type()`

`ElementHandle.type()` is deprecated. Use `Locator.pressSequentially()` for typing character-by-character or `Locator.fill()` for setting a value directly.

```ts
// ❌ Deprecated
await editor.type('Hello world');

// ✅ Current API
await editor.pressSequentially('Hello world');
// or, for plain inputs:
await editor.fill('Hello world');
```

### 10. Replace `waitForSelector` with web-first assertions

`waitForSelector` is a lower-level Page API that doesn't integrate with Playwright's auto-retry logic as cleanly as locator-based assertions.

```ts
// ❌ Lower-level Page API
await page.waitForSelector('[data-testid="goal-square"]');

// ✅ Web-first
await expect(page.getByTestId('goal-square').first()).toBeVisible();
```

---

## Anti-Patterns with Before/After Examples

### A. `waitForTimeout` → `waitForResponse` / `expect().toBeVisible()`

```ts
// ❌ Before
await page.waitForTimeout(500); // "wait for animation"

// ✅ After — wait for actual animation end via visibility
await expect(page.getByTestId('milestone-item')).toBeVisible();
```

```ts
// ❌ Before
await page.waitForTimeout(1000); // "wait for save"

// ✅ After — wait for the PATCH to complete
await page.waitForResponse(
  (resp) => resp.url().includes('/milestones') && resp.request().method() === 'PATCH',
  { timeout: 5000 }
);
```

### B. `waitForSelector` → `expect(locator).toBeVisible()`

```ts
// ❌ Before
await page.waitForSelector('[data-testid="goal-modal"]');

// ✅ After
await expect(page.getByTestId('goal-modal')).toBeVisible();
```

```ts
// ❌ Before
await page.waitForSelector(`text=${boardName}`, { timeout: 5000 });

// ✅ After
await expect(page.getByText(boardName)).toBeVisible({ timeout: 5000 });
```

### C. CSS class assertions → semantic/ARIA assertions

```ts
// ❌ Before — couples test to Tailwind class names
await expect(button).toHaveClass(/bg-blue-500/);

// ✅ After — asserts user-visible state
await expect(button).toBeEnabled();
// or, for completion state:
await expect(item).toHaveAttribute('data-completed', 'true');
```

```ts
// ❌ Before
const isActive = await page.locator('.active-milestone').count();
expect(isActive).toBeGreaterThan(0);

// ✅ After
await expect(page.getByTestId('milestone-item').first()).toHaveAttribute('aria-checked', 'true');
```

### D. CSS selector locators → semantic locators

```ts
// ❌ Before — brittle CSS selector
await page.click('button:has-text("New Board")');

// ✅ After — role-based
await page.getByRole('button', { name: 'New Board' }).click();
```

```ts
// ❌ Before
await page.click('button.bg-blue-500:has-text("Add")');

// ✅ After
await page.getByRole('button', { name: 'Add' }).click();
```

```ts
// ❌ Before — placeholder CSS locator in test-helpers
await page.fill('input[placeholder="New milestone..."]', title);

// ✅ After
await page.getByPlaceholder('New milestone...').fill(title);
```

### E. Module-level shared state → local `beforeEach` scope

```ts
// ❌ Before — in boards.spec.ts
let createdBoardId: string | null = null;
test.afterEach(async ({ page }) => {
  if (createdBoardId) { ... }
});

// ✅ After — scoped per-test
test.describe('Board creation', () => {
  let boardId: string;
  test.beforeEach(async ({ page }) => {
    boardId = await createTestBoard(page);
  });
  test.afterEach(async ({ page }) => {
    await deleteTestBoard(page, boardId);
  });
  // tests no longer need to manage boardId manually
});
```

### F. Console listener registered too late

```ts
// ❌ Before — in boards.spec.ts
test('default board has 25 goal squares with no console errors', async ({ page }) => {
  createdBoardId = await createBoardWithSize(page); // ← errors here are missed
  const consoleErrors: string[] = [];
  page.on('console', (msg) => { ... }); // too late
  ...
});

// ✅ After
test('default board has 25 goal squares with no console errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {          // ← register first
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  const boardId = await createTestBoard(page);
  await expect(page.getByTestId('goal-square')).toHaveCount(25);
  expect(consoleErrors).toHaveLength(0);
});
```

### G. Parent traversal → explicit `data-testid`

```ts
// ❌ Before — in milestones.spec.ts
const milestoneRow = page.locator('text=My Milestone').locator('..');

// ✅ After — add data-testid="milestone-row" to the component
const milestoneRow = page.getByTestId('milestone-row').filter({ hasText: 'My Milestone' });
```

### H. Duplicate helper functions → consolidate

In `test-helpers.ts`, `waitForAutoSave` and `waitForCheckboxUpdate` are identical:

```ts
// ❌ Before — two functions with identical bodies
export async function waitForAutoSave(page: Page): Promise<void> {
  await page.waitForResponse(...);
}
export async function waitForCheckboxUpdate(page: Page): Promise<void> {
  await page.waitForResponse(...); // exact same body
}

// ✅ After — one function, expressive name
export async function waitForGoalPatch(page: Page): Promise<void> {
  await page.waitForResponse(
    (resp) => resp.url().includes('/goals') && resp.request().method() === 'PATCH',
    { timeout: 5000 }
  );
}
```

### I. `editor.type()` → `pressSequentially()`

```ts
// ❌ Before — deprecated ElementHandle API
const editor = await page.$('[contenteditable]');
await editor.type('Hello world');

// ✅ After
await page.locator('[contenteditable]').pressSequentially('Hello world');
```

### J. Weak assertions → specific assertions

```ts
// ❌ Before — truthy-check only
expect(milestoneData).toBeTruthy();

// ✅ After — asserts actual shape
expect(milestoneData).toHaveLength(1);
expect(milestoneData[0].title).toBe('First Milestone');
expect(milestoneData[0].completed).toBe(false);
```

---

## Existing Test Audit

Summary of anti-patterns found across the test suite (from issue #101 analysis):

| File | Anti-Pattern | Details |
|------|-------------|---------|
| `tests/milestones.spec.ts` | `waitForTimeout` | Arbitrary sleep waits for animation/save |
| `tests/milestones.spec.ts` | Non-semantic locators | CSS selectors instead of `getByRole` / `getByTestId` |
| `tests/milestones.spec.ts` | Fragile parent traversal | `.locator('..')` to find milestone container |
| `tests/milestones.spec.ts` | Weak assertions | Truthy-only checks on DB results |
| `tests/sharing.spec.ts` | `waitForTimeout` | Arbitrary sleep after share action |
| `tests/sharing.spec.ts` | Non-semantic locators | CSS selectors for share UI elements |
| `tests/goal-dates.spec.ts` | `waitForTimeout` | Sleep instead of waiting for response/visibility |
| `tests/goal-dates.spec.ts` | Fragile parent traversal | `.locator('..')` for date container |
| `tests/goals.spec.ts` | Fragile CSS class assertions | Class-based completion checks |
| `tests/goals.spec.ts` | Weak assertions | Broad existence checks |
| `tests/goals.spec.ts` | Console listener too late | Registered after navigation |
| `tests/rich-text-editor.spec.ts` | Fragile CSS class assertions | Checks editor active state via class |
| `tests/rich-text-editor.spec.ts` | `editor.type()` deprecated | Uses old `ElementHandle.type()` API |
| `tests/boards.spec.ts` | Module-level shared state | `let createdBoardId` at module scope |
| `tests/boards.spec.ts` | Non-semantic locators | `button:has-text(...)` CSS selector |
| `tests/boards.spec.ts` | Console listener too late | Registered mid-test after board creation |
| `tests/boards.spec.ts` | `waitForSelector` | Used instead of `expect().toBeVisible()` |
| `tests/test-helpers.ts` | Non-semantic locators | `click('button:has-text(...)')`, `fill('input[id=...]')` |
| `tests/test-helpers.ts` | `waitForSelector` | Used in `createTestBoard` and `openFirstGoalModal` |
| `tests/test-helpers.ts` | Duplicate helpers | `waitForAutoSave` ≡ `waitForCheckboxUpdate` |
| `tests/test-helpers.ts` | CSS selector in `addMilestone` | `button.bg-blue-500:has-text("Add")` |
| All spec files | `waitForSelector` | Should be replaced with `expect(locator).toBeVisible()` |

---

## Action Checklist

Work through these in priority order. Each item maps to one or more files above.

- [ ] **P0 — Replace all `waitForTimeout` calls**
  Files: `milestones.spec.ts`, `sharing.spec.ts`, `goal-dates.spec.ts`
  Replace with `waitForResponse(...)` for saves, `expect(locator).toBeVisible()` for UI transitions.

- [ ] **P0 — Replace all `waitForSelector` calls**
  Files: all spec files, `test-helpers.ts`
  Replace with `await expect(page.getByTestId(...)).toBeVisible()` or `await expect(page.getByRole(...)).toBeVisible()`.

- [ ] **P1 — Fix module-level shared state**
  File: `boards.spec.ts`
  Move `createdBoardId` into `beforeEach` / `afterEach` local scope.

- [ ] **P1 — Move console error listeners to top of tests**
  Files: `boards.spec.ts`, `goals.spec.ts`
  Register `page.on('console', ...)` before any navigation or actions.

- [ ] **P1 — Standardize locators to semantic APIs**
  Files: `test-helpers.ts`, `boards.spec.ts`, `milestones.spec.ts`, `sharing.spec.ts`
  Replace `page.click('button:has-text(...)')` → `page.getByRole('button', { name: '...' }).click()`
  Replace `page.fill('input[id=...]', ...)` → `page.getByLabel('...')` or `page.getByTestId('...')`
  Replace `page.fill('input[placeholder=...]', ...)` → `page.getByPlaceholder('...')`

- [ ] **P1 — Replace CSS class assertions with semantic assertions**
  Files: `goals.spec.ts`, `rich-text-editor.spec.ts`
  Use `toBeChecked()`, `toHaveAttribute('data-*', ...)`, or `toHaveAttribute('aria-*', ...)`.

- [ ] **P2 — Fix fragile parent-traversal locators**
  Files: `milestones.spec.ts`, `goal-dates.spec.ts`
  Add `data-testid` to the target elements in the component, then use `getByTestId(...)`.

- [ ] **P2 — Strengthen weak assertions**
  Files: `goals.spec.ts`, `milestones.spec.ts`
  Replace truthy/existence checks with specific value assertions.

- [ ] **P2 — Replace `editor.type()` with `pressSequentially()`**
  File: `rich-text-editor.spec.ts`

- [ ] **P3 — Deduplicate `waitForAutoSave` / `waitForCheckboxUpdate`**
  File: `test-helpers.ts`
  Merge into a single `waitForGoalPatch` function with a consistent name.

---

> **Contributing:** When adding or modifying tests, reference this guide in your PR description.
> If you encounter a new anti-pattern not listed here, add it with a before/after example.
