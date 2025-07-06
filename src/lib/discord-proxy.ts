"use client";
import { patchUrlMappings } from "@discord/embedded-app-sdk";

if (
  typeof window !== "undefined" &&
  window.location.hostname.endsWith(".discordsays.com")
) {
  // Fix: Don't proxy to external domains that aren't in Discord's CSP
  // This will use the same origin for API requests
  patchUrlMappings([{ prefix: "/api", target: "" }]);
}
