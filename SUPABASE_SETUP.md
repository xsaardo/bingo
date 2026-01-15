# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In" if you have an account
3. Create a new project:
   - **Organization**: Create new or select existing
   - **Project Name**: `bingo-app` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine to start

4. Wait ~2 minutes for your project to initialize

## Step 2: Get Your API Credentials

1. In your Supabase dashboard, go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the settings menu
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API keys**:
     - `anon` `public` key (safe for browser use)
     - `service_role` key (keep secret, server-only)

## Step 3: Configure Local Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the placeholder values:
   ```bash
   PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   ```

3. **Important**: Never commit `.env` to git (it's already in `.gitignore`)

## Step 4: Set Up Database Schema

Once you have your credentials configured, we'll run SQL migrations to create the tables:

1. In Supabase dashboard, go to **SQL Editor** (in sidebar)
2. Click **New Query**
3. Copy and paste the SQL from `supabase/migrations/001_initial_schema.sql`
4. Click **Run** to execute

We'll create this migration file next!

## Step 5: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Under **Email** settings:
   - Enable **Email Confirmations** (optional - can disable for faster signup)
   - Enable **Magic Link** (this is what we want!)
4. Click **Save**

## Step 6: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the **Magic Link** email template if desired
3. Default template works fine for development

## Step 7: Test the Setup

Once the database schema is created, we'll test:
- Magic link authentication
- Creating a board
- Saving goals

## Troubleshooting

### "Invalid API key"
- Double-check you copied the `anon` key, not the `service_role` key
- Make sure there are no extra spaces in `.env`
- Restart the dev server after changing `.env`

### "relation does not exist"
- You haven't run the database migrations yet
- Go to SQL Editor and run the schema creation script

### Email not sending
- Check Supabase logs: **Authentication** → **Logs**
- For development, magic links appear in the logs even if email fails
- Free tier has email rate limits (consider using a custom email provider later)

## Next Steps

After setup is complete:
- ✅ Supabase project created
- ✅ API credentials in `.env`
- ✅ Database schema created
- ✅ Magic link auth enabled
- 🎉 Ready to implement Phase 2!
