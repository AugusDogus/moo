"use client";

import { Button } from "~/components/ui/button";
import { signOut } from "~/lib/auth/client";

interface UserMenuProps {
  user: {
    name: string;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user.image && (
          <img
            src={user.image}
            alt="Profile"
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-foreground font-medium">
          Welcome back, {user.name}!
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href="/account">Account Settings</a>
        </Button>
        <Button variant="outline" size="sm" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}