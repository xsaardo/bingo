# Resend SMTP Setup for Supabase

Supabase's built-in SMTP is limited to **2 emails per hour**, which is fine for development but not for production. This guide walks you through replacing it with [Resend](https://resend.com), which offers generous free tier limits (3,000 emails/month, 100/day) and reliable deliverability.

---

## Prerequisites

- A Supabase project (see [SUPABASE_SETUP.md](../SUPABASE_SETUP.md))
- A Resend account (free tier works)
- (Optional) A custom domain you control — see [Custom Domain](#custom-domain-setup) section

---

## Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com) and click **Get Started**
2. Sign up with your email or GitHub
3. Verify your email address when prompted

---

## Step 2: Get a Resend API Key

1. In the Resend dashboard, go to **API Keys** in the left sidebar
2. Click **Create API Key**
3. Give it a name (e.g., `bingo-supabase`)
4. Set **Permission** to **Sending access**
5. Click **Add** and copy the key — it starts with `re_`

> ⚠️ **Save this key now.** Resend only shows it once.

---

## Step 3: Configure SMTP in Supabase Dashboard

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** → **Authentication** → **SMTP Settings**
4. Toggle **Enable Custom SMTP** on
5. Fill in the following fields:

   | Field            | Value                          |
   |------------------|--------------------------------|
   | **Host**         | `smtp.resend.com`              |
   | **Port**         | `465`                          |
   | **Username**     | `resend`                       |
   | **Password**     | Your Resend API key (`re_...`) |
   | **Sender email** | `onboarding@resend.dev`        |
   | **Sender name**  | `Bingo` (or your app name)     |

   > 📝 **Note on Sender Email:** Without a custom domain, you must use `onboarding@resend.dev` as the sender. [Adding a custom domain](#custom-domain-setup) lets you use your own address (e.g., `noreply@yourdomain.com`).

6. Click **Save**

---

## Step 4: Test the Configuration

### Option A: Trigger a real auth email

1. Go to **Authentication** → **Users** in Supabase
2. Click **Invite User** and enter a test email address you control
3. Check that email arrives within a few seconds
4. Check Resend dashboard → **Emails** to confirm it was sent and delivered

### Option B: Use the Supabase auth flow in your app

1. Run your app locally
2. Trigger a sign-up or password reset
3. Confirm the email arrives and links work correctly

### Troubleshooting

- **No email received:** Double-check your API key and that the sender email is `onboarding@resend.dev`
- **Authentication failed:** Make sure Username is exactly `resend` (lowercase)
- **Port issues:** Try port `587` with TLS if `465` (SSL) does not work in your environment
- **Check Resend logs:** Dashboard → **Emails** shows delivery status and error details

---

## Custom Domain Setup

Adding a custom domain lets you send from your own address (e.g., `noreply@yourdomain.com`) instead of `onboarding@resend.dev`. This improves deliverability and brand trust.

### What changes with a custom domain:

1. **In Resend:**
   - Go to **Domains** → **Add Domain**
   - Enter your domain (e.g., `yourdomain.com`)
   - Add the DNS records Resend gives you (SPF, DKIM, DMARC) to your domain registrar
   - Wait for verification (usually a few minutes to a few hours)

2. **Back in Supabase SMTP settings:**
   - Update **Sender email** from `onboarding@resend.dev` to your own address (e.g., `noreply@yourdomain.com`)
   - Everything else (host, port, username, password) stays the same

3. **No code changes required** — the update is purely in configuration

### DNS records you will add (Resend provides exact values):

| Type  | Purpose                                  |
|-------|------------------------------------------|
| TXT   | SPF — authorizes Resend to send for you  |
| CNAME | DKIM — cryptographic email signing       |
| TXT   | DMARC — policy for failed verification   |

---

## Summary

| Setting        | Without Custom Domain        | With Custom Domain              |
|----------------|------------------------------|---------------------------------|
| Host           | `smtp.resend.com`            | `smtp.resend.com`               |
| Port           | `465`                        | `465`                           |
| Username       | `resend`                     | `resend`                        |
| Password       | Resend API key               | Resend API key                  |
| Sender email   | `onboarding@resend.dev`      | `you@yourdomain.com`            |

---

## References

- [Resend Documentation](https://resend.com/docs)
- [Resend + Supabase Guide](https://resend.com/docs/send-with-supabase-smtp)
- [Supabase Auth Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Resend Domain Setup](https://resend.com/docs/dashboard/domains/introduction)
