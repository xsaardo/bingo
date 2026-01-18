# Deployment Guide

This guide covers deploying the Bingo Board app to Vercel.

## Prerequisites

- A GitHub account (this repo should be pushed to GitHub)
- A Vercel account (free tier available at https://vercel.com)

## Deploying to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push this branch to GitHub**
   ```bash
   git push -u origin deploy/public-hosting
   ```

2. **Import to Vercel**
   - Go to https://vercel.com and sign in
   - Click "Add New..." → "Project"
   - Import your GitHub repository (xsaardo/bingo)
   - Select the `deploy/public-hosting` branch (or `main` if merged)

3. **Configure Project**
   - Framework Preset: Vercel will auto-detect **SvelteKit**
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.svelte-kit/output` (auto-filled)
   - Install Command: `npm install` (auto-filled)

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)
   - Your app will be live at `https://[your-project-name].vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts to configure your project
   - For production deployment: `vercel --prod`

## Environment Variables

This app uses client-side localStorage only, so no environment variables are required.

## Custom Domain (Optional)

After deployment, you can add a custom domain:

1. Go to your project dashboard on Vercel
2. Navigate to "Settings" → "Domains"
3. Add your custom domain and follow DNS configuration instructions

## Automatic Deployments

Once connected to GitHub, Vercel will automatically:
- Deploy every push to the production branch
- Create preview deployments for pull requests
- Run builds and checks before deploying

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Run `npm run build` locally to test

### App Doesn't Load
- Check browser console for errors
- Verify the build output in Vercel dashboard
- Ensure localStorage is enabled in browser settings

## Local Preview

To preview the production build locally:
```bash
npm run build
npm run preview
```

## Notes

- The app uses `@sveltejs/adapter-auto` which automatically detects and configures for Vercel
- All data is stored in browser localStorage (no backend required)
- The app is fully static and can be deployed to other platforms (Netlify, Cloudflare Pages, etc.) with minimal changes
