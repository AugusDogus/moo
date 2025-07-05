"use client";
import { patchUrlMappings } from "@discord/embedded-app-sdk";

if (
  typeof window !== "undefined" &&
  window.location.hostname.endsWith(".discordsays.com")
) {
  patchUrlMappings([{ prefix: "/api", target: "moo.augie.gg" }]);
}
