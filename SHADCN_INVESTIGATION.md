# shadcn/ui Investigation: UI Overhaul Feasibility

> Investigation for [Issue #30](https://github.com/xsaardo/bingo/issues/30)

---

## TL;DR

**Recommendation: Use [shadcn-svelte](https://shadcn-svelte.com/)** — the community Svelte port — rather than the React-based shadcn/ui.

shadcn-svelte is compatible with SvelteKit, supports Tailwind CSS (including v4), and offers a component-by-component adoption path with no framework lock-in. Migration is **medium effort** (~1.5–2 weeks for full coverage) and can be done incrementally without breaking existing Supabase auth flows.

---

## 1. shadcn/ui vs shadcn-svelte

| Criterion | shadcn/ui (React) | shadcn-svelte |
|---|---|---|
| Framework | React only | Svelte 4 + Svelte 5 |
| SvelteKit support | ❌ Not applicable | ✅ First-class |
| Tailwind CSS v4 | ✅ | ✅ (v0.16+) |
| Component count | ~50+ | ~40+ (parity on core) |
| Accessibility | ✅ (Radix UI) | ✅ (bits-ui / Melt UI) |
| Active maintenance | ✅ Official | ✅ Community (well-maintained) |
| Copy-own model | ✅ | ✅ (same philosophy) |

**Verdict:** Use **shadcn-svelte**. The React version is not usable in a SvelteKit project without a React adapter, which adds unnecessary complexity and bundle size.

---

## 2. Compatibility Assessment

### SvelteKit

shadcn-svelte v0.16+ targets **Svelte 5** and SvelteKit 2, which matches this project exactly:

```json
"svelte": "^5.45.6",
"@sveltejs/kit": "^2.49.1"
```

✅ **Full compatibility confirmed.**

### Tailwind CSS

This project uses **Tailwind CSS v4** (`"tailwindcss": "^4.1.18"`) with the new `@import 'tailwindcss'` syntax in `app.css`. shadcn-svelte v0.16+ supports Tailwind v4 natively. The design token system (CSS variables for colors, radius, etc.) will need to be added to `app.css` during init.

✅ **Compatible with minor CSS variable additions.**

### Supabase Auth

shadcn-svelte operates purely at the UI component level and has no opinion on backend, auth, or data-fetching. Existing Supabase flows in `$lib/stores/auth.ts`, `AuthGuard.svelte`, and route-level `+layout.svelte` files are **unaffected**.

✅ **No conflicts with Supabase auth.**

---

## 3. Component Coverage Analysis

| Current Component | shadcn-svelte Equivalent | Notes |
|---|---|---|
| `GoalModal.svelte` | `Dialog` | Full replacement; handles focus trap, escape key, backdrop |
| `ConfirmationModal.svelte` | `AlertDialog` | Designed exactly for confirm/cancel flows |
| `CreateBoardModal.svelte` | `Dialog` + `Form` | Dialog wrapper + form primitives |
| `DeleteBoardModal.svelte` | `AlertDialog` | Same as ConfirmationModal |
| `UserMenu.svelte` | `DropdownMenu` | Handles positioning, keyboard nav |
| `CheckboxButton.svelte` | `Checkbox` | Accessible checkbox with label |
| `ErrorAlert.svelte` | `Alert` | Styled alert with variants |
| `BoardSizeSelector.svelte` | `Select` or `RadioGroup` | Depends on UX preference |
| `MagicLinkForm.svelte` | `Form` + `Input` + `Button` | Form primitives |
| `BingoBoard.svelte` | Custom (no direct equivalent) | Layout is unique; keep custom |
| `GoalSquare.svelte` | Custom (partial: `Card`) | Custom interaction logic; partial |
| `RichTextEditor.svelte` | Custom (no equivalent) | TipTap-based; keep custom |
| `DragHandle.svelte` | Custom | Drag interaction; keep custom |
| `Confetti.svelte` | Custom | Animation; keep custom |

**~9 of 21 components** have direct shadcn-svelte equivalents. The rest are custom interaction components that should remain custom.

---

## 4. Migration Effort Estimate

| Phase | Work | Estimate |
|---|---|---|
| Setup & init | Install shadcn-svelte, configure CSS variables, update `app.css` | 2–4 hours |
| Modal components | Migrate GoalModal, ConfirmationModal, CreateBoardModal, DeleteBoardModal | 2–3 days |
| UserMenu | Migrate to DropdownMenu | 0.5 days |
| Form components | CheckboxButton, MagicLinkForm inputs | 1 day |
| Alert/feedback | ErrorAlert, loading states | 0.5 days |
| Testing & polish | Cross-browser, a11y audit, visual regression | 1–2 days |
| **Total** | | **~1.5–2 weeks** |

---

## 5. Installation

```bash
# Install shadcn-svelte CLI
npx shadcn-svelte@latest init

# Add individual components (copy-own model — no package import)
npx shadcn-svelte@latest add dialog
npx shadcn-svelte@latest add alert-dialog
npx shadcn-svelte@latest add dropdown-menu
npx shadcn-svelte@latest add button
npx shadcn-svelte@latest add checkbox
npx shadcn-svelte@latest add alert
npx shadcn-svelte@latest add input
```

Components are copied into `src/lib/components/ui/` and are fully owned — no runtime dependency on shadcn-svelte after generation.

---

## 6. Prototype: Button Component

As a proof-of-concept, a `Button` component following the shadcn-svelte pattern has been added at:

**`src/lib/components/ui/Button.svelte`**

This demonstrates:
- CSS variable-based theming compatible with the existing Tailwind setup
- Variant support (default, outline, ghost, destructive)
- Size variants (sm, default, lg, icon)
- Svelte 5 `$props()` API with full TypeScript types
- Drop-in replacement for `<button>` elements throughout the app

Usage:
```svelte
<script>
  import Button from '$lib/components/ui/Button.svelte';
</script>

<Button variant="outline" size="sm" onclick={handleSave}>Save Goal</Button>
<Button variant="destructive" onclick={handleDelete}>Delete</Button>
```

---

## 7. Answers to Issue Questions

**1. Should we use shadcn/ui (React) or shadcn-svelte?**
→ **shadcn-svelte**. React is not an option for this SvelteKit project. shadcn-svelte is well-maintained, Svelte 5-compatible, and follows the same copy-own philosophy.

**2. What is the incremental migration path — can we adopt components one at a time?**
→ **Yes.** Because shadcn-svelte components are copied into your repo (not imported from a package), there is zero coupling. You can replace components one at a time, starting with modals (highest value), without touching unrelated code. Recommended order: AlertDialog → Dialog → DropdownMenu → Button/Checkbox → Alert → Input.

**3. Does this conflict with our current Tailwind CSS setup?**
→ **No significant conflict.** The setup adds CSS custom properties (design tokens) to `app.css` for colors and radius. These coexist with existing Tailwind utility classes. One consideration: shadcn-svelte uses Tailwind v3-style config by default; with v4 the init flow may need manual CSS variable injection rather than a `tailwind.config.js` plugin. Feasible with minimal effort.

**4. What is the rough level of effort?**
→ **~1.5–2 weeks** for full migration of all applicable components, including testing. Can ship value immediately by starting with the modal components (highest accessibility and consistency wins).

---

## 8. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Tailwind v4 CSS variable incompatibility | Low | Manually define variables in `app.css`; shadcn-svelte init supports v4 in recent releases |
| Svelte 5 runes API mismatch | Low | shadcn-svelte v0.16+ targets Svelte 5; verify component versions match |
| Visual regression from design token changes | Medium | Introduce tokens incrementally; use existing class overrides for any divergence |
| bits-ui peer dependency conflicts | Low | bits-ui (the underlying accessibility primitive) is the only new runtime dependency |

---

## 9. Recommendation

**Proceed with shadcn-svelte adoption.** Start with a pilot migration of `ConfirmationModal.svelte` → `AlertDialog` as it's a contained, low-risk component with clear accessibility improvements. If the pilot goes smoothly (estimate: 2–3 hours), expand to the remaining modal components.

The copy-own model means there is **no long-term vendor dependency** risk — all components live in the repo and can be customized freely.
