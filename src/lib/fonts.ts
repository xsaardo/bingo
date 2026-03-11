// ABOUTME: Central font registry — defines valid board fonts, their CSS font stacks, and display labels.
// ABOUTME: Add a new entry here to support a new font; the type, validator, and UI selector all derive from this registry.

export const FONT_REGISTRY = {
  default: { label: 'Default' },
  chanellie: { label: 'Chanellie' }
} as const;

export type Font = keyof typeof FONT_REGISTRY;

export function parseFont(raw: unknown): Font {
  return typeof raw === 'string' && raw in FONT_REGISTRY ? (raw as Font) : 'default';
}
