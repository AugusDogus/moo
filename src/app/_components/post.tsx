"use client";

import { useState } from "react";

import type { Session } from "better-auth";

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
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Most recent post: {latestPost.name}</p>
      ) : (
        <p>There are no posts yet.</p>
      )}
      {session ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (session) {
              createPost.mutate({ name });
            } else {
              void signIn();
            }
          }}
          className="flex flex-col gap-2"
        >
          <input
            type="text"
            placeholder="Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
          />
          <button
            type="submit"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
            disabled={createPost.isPending}
          >
            {createPost.isPending ? "Submitting..." : "Submit"}
          </button>
        </form>
      ) : (
        <button onClick={() => void signIn()}>Sign in</button>
      )}
    </div>
  );
}
