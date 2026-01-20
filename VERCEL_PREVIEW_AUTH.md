# Vercel Preview Branch Authentication Setup

This guide explains how to configure Supabase authentication to work correctly with Vercel preview deployments.

## The Problem

By default, Supabase magic links redirect to the "Site URL" configured in your Supabase project settings. This means that when you test a preview branch on Vercel, the magic link will redirect you to your production domain instead of the preview URL.

## The Solution

Configure Supabase to allow redirects to your Vercel preview branch URLs using wildcard patterns.

## Step-by-Step Configuration

### 1. Get Your Vercel Project URL Pattern

Your Vercel preview URLs follow this pattern:
```
https://bingo-[hash]-xsaardo.vercel.app
https://bingo-git-[branch-name]-xsaardo.vercel.app
```

### 2. Configure Supabase Redirect URLs

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. In the **Redirect URLs** section, add the following patterns:

```
# Production URL
https://your-production-domain.com/auth/callback
https://your-production-domain.com/*

# Vercel preview branches (wildcard)
https://*.vercel.app/auth/callback
https://*.vercel.app/*

# Specific project patterns (more secure)
https://bingo-*.vercel.app/auth/callback
https://bingo-git-*.vercel.app/auth/callback

# Localhost for development
http://localhost:5173/auth/callback
http://localhost:5173/*
```

### 3. Update Site URL (Optional)

In **Authentication** → **URL Configuration**:
- **Site URL**: Set this to your production domain
  ```
  https://your-production-domain.com
  ```

### 4. Configure Additional Redirect URLs in Supabase

In the same **URL Configuration** section, you can also add:
```
# For main/master branch deployments
https://bingo-xsaardo.vercel.app/auth/callback

# For specific feature branches you're testing
https://bingo-git-claude-improve-notes-feature-CdYGM-xsaardo.vercel.app/auth/callback
```

## How It Works

1. **User enters email** on preview branch: `https://bingo-abc123.vercel.app/auth/login`
2. **App sends magic link** with `emailRedirectTo: https://bingo-abc123.vercel.app/auth/callback`
3. **User clicks link** in email
4. **Supabase checks** if the redirect URL matches the allowed patterns
5. **User is redirected** back to the correct preview branch

## Code Implementation

The app is already configured to use the current domain dynamically:

```typescript
// src/lib/utils/auth.ts
const callbackUrl = redirectTo || `${window.location.origin}/auth/callback`;
```

This means:
- ✅ Production → redirects to production
- ✅ Preview branch → redirects to that preview branch
- ✅ Localhost → redirects to localhost

## Security Considerations

### Using Wildcards

While `https://*.vercel.app/*` is convenient, it's less secure because it allows any Vercel app to use your Supabase project for authentication.

**More secure option**: Use project-specific wildcards:
```
https://bingo-*.vercel.app/auth/callback
https://bingo-git-*.vercel.app/auth/callback
```

This limits redirects to only your project's preview branches.

### Production Best Practice

For production, always use exact URLs without wildcards:
```
https://your-actual-domain.com/auth/callback
https://www.your-actual-domain.com/auth/callback
```

## Testing

1. **Deploy to a preview branch** on Vercel
2. **Open the preview URL**: `https://bingo-[hash].vercel.app`
3. **Try logging in** with magic link
4. **Check browser console** for the log: "Sending magic link with redirect to: [URL]"
5. **Click the magic link** in your email
6. **Verify** you're redirected back to the preview URL (not production)

## Troubleshooting

### Magic link redirects to production

**Cause**: Supabase redirect URL allowlist doesn't include your preview branch pattern

**Fix**: Add wildcard patterns to Supabase redirect URLs (see step 2 above)

### "Invalid redirect URL" error

**Cause**: The redirect URL doesn't match any allowed pattern in Supabase

**Fix**:
1. Check the browser console for the actual redirect URL being used
2. Add that specific URL or pattern to Supabase redirect URLs
3. Wait a few minutes for Supabase to update (changes aren't instant)

### Magic link works in production but not preview

**Cause**: Site URL in Supabase is set to production only

**Fix**: Add preview branch patterns to **Redirect URLs** (not Site URL)

## Environment Variables (Optional)

If you want to override the redirect URL per environment:

1. **Add to `.env` files**:
```bash
# .env.local (development)
PUBLIC_AUTH_CALLBACK_URL=http://localhost:5173/auth/callback

# Vercel environment variables (production)
PUBLIC_AUTH_CALLBACK_URL=https://your-domain.com/auth/callback
```

2. **Update the code** to use the environment variable:
```typescript
// src/lib/utils/auth.ts
import { PUBLIC_AUTH_CALLBACK_URL } from '$env/static/public';

const callbackUrl = redirectTo ||
  PUBLIC_AUTH_CALLBACK_URL ||
  `${window.location.origin}/auth/callback`;
```

However, using `window.location.origin` (current approach) is simpler and works automatically for all environments.

## Recommended Configuration

For most cases, use this setup in Supabase:

```
Site URL: https://your-production-domain.com

Redirect URLs:
https://your-production-domain.com/**
https://bingo-*.vercel.app/**
https://bingo-git-*.vercel.app/**
http://localhost:5173/**
http://localhost:*/**
```

This provides a good balance of flexibility and security.
