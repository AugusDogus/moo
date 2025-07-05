"use client";

import Image from "next/image";
import Link from "next/link";
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
          <Image
            src={user.image}
            alt="Profile"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span className="text-foreground font-medium">
          Welcome back, {user.name}!
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/account">Account Settings</Link>
        </Button>
        <Button variant="outline" size="sm" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
