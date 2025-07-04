"use client";

import { MessageSquare, Plus, User } from "lucide-react";
import { useState } from "react";

import type { Session } from "better-auth";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { signIn } from "~/lib/auth/client";
import { api } from "~/trpc/react";

export function LatestPost({ session }: { session: Session | null }) {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Latest Posts
        </CardTitle>
        <CardDescription>
          {latestPost
            ? "Most recent post from the community"
            : "No posts yet - be the first!"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestPost ? (
          <div className="bg-muted rounded-lg p-3">
            <p className="text-muted-foreground text-sm">Most recent post:</p>
            <p className="truncate font-medium">{latestPost.name}</p>
          </div>
        ) : (
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-muted-foreground text-sm">No posts yet</p>
          </div>
        )}

        {session ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (session && name.trim()) {
                createPost.mutate({ name: name.trim() });
              }
            }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <label htmlFor="post-title" className="text-sm font-medium">
                Create a new post
              </label>
              <Input
                id="post-title"
                type="text"
                placeholder="Enter post title..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={createPost.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createPost.isPending || !name.trim()}
            >
              {createPost.isPending ? (
                "Creating..."
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Post
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-muted-foreground text-sm">
              Sign in to create and share posts
            </p>
            <Button onClick={() => void signIn()} className="w-full">
              <User className="h-4 w-4" />
              Sign in to continue
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
