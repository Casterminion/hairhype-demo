# Netlify Migration Instructions

## IMPORTANT: Remove Hardcoded Credentials Before Netlify Deploy

### Current State (Bolt.new Deployment)
The application currently has Supabase credentials **hardcoded** in `vite.config.ts` to work around Bolt.new's .env limitations.

### Before Deploying to Netlify Tonight

#### Step 1: Remove Hardcoded Credentials from vite.config.ts

**FIND THIS SECTION:**
```typescript
define: {
  'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://wutgnceyggqygtfqtirb.supabase.co'),
  'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
},
```

**DELETE THE ENTIRE `define` BLOCK** (lines 8-11 in vite.config.ts)

**After removal, vite.config.ts should look like:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'fs';

export default defineConfig({
  envPrefix: 'VITE_',

  plugins: [
    react(),
    {
      name: 'copy-headers',
      closeBundle() {
        copyFileSync('_headers', 'dist/_headers');
      }
    }
  ],
  // ... rest of config
});
```

#### Step 2: Add Environment Variables in Netlify Dashboard

1. Go to your Netlify site
2. Navigate to: **Site Settings → Environment Variables**
3. Click **Add a variable**
4. Add these two variables:

**Variable 1:**
- Key: `VITE_SUPABASE_URL`
- Value: `https://wutgnceyggqygtfqtirb.supabase.co`

**Variable 2:**
- Key: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dGduY2V5Z2dxeWd0ZnF0aXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTY0ODUsImV4cCI6MjA3ODEzMjQ4NX0.areTRdHixNt01aDtVguw_wNVxBbe3ADAQ7DzNo4HDzA`

5. Click **Save**

#### Step 3: Deploy to Netlify

After removing hardcoded values and adding environment variables:
1. Push your code to GitHub
2. Connect repository to Netlify
3. Deploy

Netlify will automatically:
- Read environment variables from dashboard
- Inject them at build time
- Keep credentials secure and out of git

### Why This Matters

**Security:**
- Hardcoded credentials in `vite.config.ts` would be committed to git
- Anyone with repo access could see production credentials
- Netlify environment variables are encrypted and secure

**Best Practice:**
- Development: Uses `.env` file (git-ignored)
- Bolt.new: Uses hardcoded values (temporary workaround)
- Netlify Production: Uses dashboard environment variables (secure)

### Files That Reference Environment Variables

These files correctly use `import.meta.env.VITE_*`:
- `src/lib/supabase.ts` - Supabase client initialization
- All admin pages
- All service files
- No changes needed to these files

### Verification After Netlify Deploy

Open browser console and check for:
```
✓ Supabase URL: Found ✓
✓ Supabase Key: Found ✓
✓ Supabase initialized successfully ✓
```

If you see "Missing ✗", check that environment variables are correctly set in Netlify dashboard.

### Current .env File

The `.env` file in the root directory contains the same credentials.
This file is:
- Git-ignored (safe)
- Only used in local development
- Not used in production builds

### Emergency Rollback

If environment variables don't work on Netlify, you can temporarily:
1. Re-add the `define` block to `vite.config.ts`
2. Redeploy
3. Debug the environment variable configuration

But proper solution is to use Netlify's environment variables.
