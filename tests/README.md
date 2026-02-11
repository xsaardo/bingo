# Test Setup Guide

## Authentication Setup for Tests

Tests use a dedicated test user account with password authentication (instead of magic links) for speed and reliability.

### Initial Setup (One-time)

1. **Create a test user in Supabase:**
   - Go to your Supabase project → Authentication → Users
   - Click "Add user" → "Create new user"
   - Email: `test@example.com` (or your preferred test email)
   - Password: Create a strong password
   - Enable "Auto Confirm User" to skip email verification

2. **Enable password authentication:**
   - Go to Authentication → Providers
   - Ensure "Email" provider is enabled
   - Confirm password sign-in is allowed

3. **Set environment variables:**

   Create a `.env.test` file in the project root:

   ```bash
   TEST_USER_EMAIL=test@example.com
   TEST_USER_PASSWORD=your-test-password-here
   ```

   Or export them in your shell:

   ```bash
   export TEST_USER_EMAIL=test@example.com
   export TEST_USER_PASSWORD=your-test-password-here
   ```

### Running Tests

```bash
# Run all tests (auth setup runs automatically first)
npm test

# Run specific test file
npm test tests/phase2-data-model.spec.ts

# Run with UI mode
npm run test:ui
```

### How It Works

1. **Setup Phase** (`tests/auth.setup.ts`):
   - Runs before all tests
   - Signs in with password auth
   - Saves authentication state to `tests/.auth/user.json`

2. **Test Phase**:
   - All tests start with saved auth state
   - No re-login needed
   - Tests run fast and reliably

### Troubleshooting

**"Auth failed" error:**

- Verify test user exists in Supabase
- Check email/password are correct in environment variables
- Ensure password auth is enabled in Supabase

**Tests timing out:**

- Check dev server is running (`npm run dev`)
- Verify `http://localhost:5173` is accessible
- Check Supabase connection in browser console

**Auth state stale:**

- Delete `tests/.auth/user.json`
- Re-run tests to regenerate auth state
