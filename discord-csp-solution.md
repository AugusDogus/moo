# Discord CSP Issue Solution

## Problem
Your Discord embedded app is encountering a Content Security Policy (CSP) error:
```
Refused to frame 'https://moo.augie.gg/' because it violates the following Content Security Policy directive: "frame-src..."
```

## Root Cause
The issue occurs because:
1. Discord is trying to frame the entire `moo.augie.gg` domain directly
2. `moo.augie.gg` is not in Discord's CSP allowlist for `frame-src`
3. Your `discord-proxy.ts` configuration is correct for API proxying (you need this for tRPC calls)
4. The problem is likely in your Discord Developer Portal configuration

## Solution Options

### Option 1: Fix Discord Developer Portal Configuration (Recommended)

The issue is that your Discord app is configured to frame `moo.augie.gg` directly, which violates Discord's CSP. You need to host your app on a domain that Discord can proxy to.

1. **Deploy your app to a Discord-compatible domain:**
   - Use Vercel, Netlify, or similar platform with a standard domain
   - Ensure the domain doesn't conflict with Discord's CSP restrictions
   - Example: `your-app.vercel.app` or `your-app.netlify.app`

2. **Update Discord Developer Portal:**
   - Go to https://discord.com/developers/applications
   - Select your app
   - In the "Activities" section, update the App URL to point to your new deployment
   - Remove any references to `moo.augie.gg` as the main app URL

3. **Keep your proxy configuration (it's correct):**
```typescript
// src/lib/discord-proxy.ts - Keep this as is!
"use client";
import { patchUrlMappings } from "@discord/embedded-app-sdk";

if (
  typeof window !== "undefined" &&
  window.location.hostname.endsWith(".discordsays.com")
) {
  patchUrlMappings([{ prefix: "/api", target: "moo.augie.gg" }]);
}
```

### Option 2: Use Discord's Built-in Proxy System

If you must use `moo.augie.gg`, configure it through Discord's proxy system:

1. **Update your client-side code to use `/.proxy/` prefix:**
```typescript
// In your tRPC client configuration
const apiUrl = isInDiscordIframe() ? "/.proxy/api" : "/api";
```

2. **Ensure your Next.js rewrites are correct:**
```javascript
// next.config.js (already correct)
async rewrites() {
  return [
    {
      source: "/.proxy/api/:path*",
      destination: "https://moo.augie.gg/api/:path*",
    },
  ];
}
```

### Option 3: Whitelist Your Domain (Advanced)

Contact Discord support to potentially whitelist `moo.augie.gg` in their CSP, though this is unlikely to be approved for custom domains.

## Discord Developer Portal Configuration

1. **Go to Discord Developer Portal**
2. **Select your application**
3. **Navigate to "Activities" section**
4. **Configure the following:**
   - **App URL**: Should point to your deployed app (not moo.augie.gg if it's not whitelisted)
   - **Target URL Mapping**: Configure proper URL mappings if needed
   - **Embedded App SDK**: Ensure it's enabled

## Testing Your Fix

After implementing the solution:

1. **Test in Discord client:**
   - Open your app activity in Discord
   - Verify no CSP errors in browser console
   - Test the login flow

2. **Test outside Discord:**
   - Ensure your app still works when accessed directly
   - Verify fallback authentication works

## Environment Configuration

Make sure your environment variables are properly configured:

```bash
# .env.local
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
BETTER_AUTH_URL=https://your-app-domain.com
```

## Additional Notes

- Discord's CSP is quite restrictive and only allows specific domains
- When running as an embedded app, your app is served from Discord's infrastructure
- The `/.proxy/` prefix in your rewrites should handle the proxying correctly
- Make sure your app is deployed and accessible from the configured domain

## Immediate Action Required

The issue is that Discord is trying to frame `moo.augie.gg` directly, which violates Discord's CSP. The quickest fix is:

1. **Deploy your app to a standard hosting platform** (Vercel, Netlify, etc.)
2. **Update your Discord app configuration** in the Developer Portal to point to the new deployment
3. **Keep your existing proxy configuration** - it's correct for API calls

Your current setup with `patchUrlMappings([{ prefix: "/api", target: "moo.augie.gg" }])` is correct for tRPC calls and should not be changed.