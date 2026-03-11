# Email Templates

These are the Supabase email templates for Bingoal.

## Applying the magic link template

1. Go to the Supabase dashboard → Authentication → Email Templates → Magic Link
2. Set the **Subject** to: `Your Bingoal sign-in link`
3. Copy the contents of `magic-link.html` into the HTML body field
4. Copy the contents of `magic-link.txt` into the plain text body field (if supported)
5. Save

## Template variables

- `{{ .ConfirmationURL }}` — the magic link URL (injected by Supabase)
