# Discord CSP Issue Solution

## Problem
Your Discord embedded app is encountering a Content Security Policy (CSP) error:
```
Refused to frame 'https://moo.augie.gg/' because it violates the following Content Security Policy directive: "frame-src..."
```

## Root Cause
The issue occurs because:
1. Your app is running in Discord's iframe context (served from `*.discordsays.com`)
2. Your `discord-proxy.ts` is configured to proxy API requests to `moo.augie.gg`
3. Discord's CSP doesn't allow framing content from `moo.augie.gg`

## Solution Options

### Option 1: Use Discord's Embedded App SDK Properly (Recommended)

When using Discord's embedded app SDK, your app should be configured to work within Discord's ecosystem:

1. **Update your `discord-proxy.ts` configuration:**
```typescript
"use client";
import { patchUrlMappings } from "@discord/embedded-app-sdk";

if (
  typeof window !== "undefined" &&
  window.location.hostname.endsWith(".discordsays.com")
) {
  // Remove the external domain mapping - this should proxy to the same origin
  patchUrlMappings([{ prefix: "/api", target: window.location.origin }]);
}
```

2. **Configure your Discord app in the Developer Portal:**
   - Go to https://discord.com/developers/applications
   - Select your app
   - In the "Activities" section, ensure your app URL is properly configured
   - The app should be hosted on a domain that Discord can proxy to

### Option 2: Deploy Your App on Discord-Compatible Infrastructure

**For Vercel/Netlify deployments:**
1. Deploy your app to a subdomain that can be proxied by Discord
2. Configure your Discord app to point to that deployment
3. Update your `discord-proxy.ts` to not proxy to external domains

**Example configuration:**
```typescript
// src/lib/discord-proxy.ts
"use client";
import { patchUrlMappings } from "@discord/embedded-app-sdk";

if (
  typeof window !== "undefined" &&
  window.location.hostname.endsWith(".discordsays.com")
) {
  // Don't proxy to external domains, use relative paths
  patchUrlMappings([{ prefix: "/api", target: "" }]);
}
```

### Option 3: Remove External Domain Dependency

The simplest fix is to modify your proxy configuration to not try to reach external domains:

```typescript
// src/lib/discord-proxy.ts
"use client";
import { patchUrlMappings } from "@discord/embedded-app-sdk";

if (
  typeof window !== "undefined" &&
  window.location.hostname.endsWith(".discordsays.com")
) {
  // Remove the external domain mapping entirely
  // This will use the same origin for API requests
  patchUrlMappings([]);
}
```

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

## Quick Fix Implementation

The immediate fix is to update your `discord-proxy.ts`:

```typescript
"use client";
import { patchUrlMappings } from "@discord/embedded-app-sdk";

if (
  typeof window !== "undefined" &&
  window.location.hostname.endsWith(".discordsays.com")
) {
  // Fix: Don't proxy to external domains
  patchUrlMappings([{ prefix: "/api", target: "" }]);
}
```

This should resolve the CSP error immediately.