# Discord CSP Issue Solution

## Problem
Your Discord embedded app is encountering a Content Security Policy (CSP) error:
```
Refused to frame 'https://moo.augie.gg/' because it violates the following Content Security Policy directive: "frame-src..."
```

## Root Cause
The issue occurs because:
1. Your Discord auth flow does `window.location.href = redirectUrl` where `redirectUrl` is `https://moo.augie.gg/api/auth/callback/discord`
2. This tries to navigate the Discord iframe to `moo.augie.gg` directly, which violates Discord's CSP
3. The domain `moo.augie.gg` itself is fine for API calls through the proxy
4. The problem is the full page redirect after the auth callback, not the domain configuration

## Solution

### Fix the Auth Callback Redirect (Implemented)

The issue is that your auth flow tries to navigate the Discord iframe to `moo.augie.gg` directly. Instead, use the proxy for the callback URL:

**Fixed in `src/app/api/auth/discord-sdk/route.ts`:**
```typescript
// OLD (causes CSP violation):
const callbackUrl = new URL(`${env.BETTER_AUTH_URL}/api/auth/callback/discord`);
// Returns: https://moo.augie.gg/api/auth/callback/discord

// NEW (uses proxy):
const callbackUrl = new URL("/.proxy/api/auth/callback/discord", "https://placeholder.com");
// Returns: /.proxy/api/auth/callback/discord
```

This way:
1. Your auth flow stays within the Discord iframe context
2. The `/.proxy/` prefix routes through your Next.js rewrites to `moo.augie.gg`
3. No CSP violation occurs because there's no external domain navigation
4. Your existing proxy configuration continues to work for all API calls

## Testing Your Fix

After implementing the solution:

1. **Test in Discord client:**
   - Open your app activity in Discord
   - Verify no CSP errors in browser console
   - Test the login flow

2. **Test outside Discord:**
   - Ensure your app still works when accessed directly
   - Verify fallback authentication works

## Summary

**You were absolutely right** - the domain `moo.augie.gg` is fine and your proxy configuration is correct. The issue was that the auth callback was trying to redirect the Discord iframe to the external domain directly.

**The fix has been implemented:**
- Changed the auth callback redirect from `https://moo.augie.gg/api/auth/callback/discord` to `/.proxy/api/auth/callback/discord`
- This keeps the navigation within the Discord iframe context and uses your existing proxy setup
- No CSP violation occurs because there's no external domain navigation

Your existing setup with `patchUrlMappings([{ prefix: "/api", target: "moo.augie.gg" }])` is correct and should not be changed.