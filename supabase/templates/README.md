# Email Templates

These are the Supabase email templates for Bingoals, styled to match the app's visual identity.

## Design

- **Colors**: Blue-600 (`#2563eb`) primary, gray tones for text, white card on gray background
- **Logo**: 3×3 bingo grid with diagonal cells filled (top-left, center, bottom-right), matching `Logo.svelte`
- **Typography**: System font stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, Roboto)
- **Layout**: Centered card (max 480px), responsive, plain-table email structure for client compatibility

## Applying the magic link template

1. Go to the Supabase dashboard → Authentication → Email Templates → **Magic Link**
2. Set the **Subject** to: `Your Bingoals sign-in link`
3. Paste the contents of `magic-link.html` into the **HTML body** field
4. Paste the contents of `magic-link.txt` into the **plain text body** field (if supported)
5. Click **Save**

## Template variables

- `{{ .ConfirmationURL }}` — the magic link URL (injected by Supabase at send time)

## Notes

- The templates use inline styles for maximum email client compatibility
- SVG logo rendering varies across email clients; most modern clients support it
- If SVG doesn't render in some clients, consider replacing with a hosted PNG logo
- Custom SMTP (e.g. Resend, SendGrid) is recommended for reliable delivery and full branding control
