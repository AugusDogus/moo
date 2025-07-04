import { headers } from "next/headers";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/lib/auth/server";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <HydrateClient>
      <main className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-12">
            <div className="space-y-4 text-center">
              <h1 className="text-foreground text-5xl font-bold tracking-tight sm:text-6xl">
                <span className="text-primary">moo</span>
              </h1>

              <p className="text-muted-foreground max-w-3xl text-lg">
                🐄 🥛 🍄 🌸 🌿 🧺
              </p>
            </div>

            <div className="text-center">
              <p className="text-foreground text-lg font-medium">
                {hello ? hello.greeting : "Loading..."}
              </p>
            </div>

            <LatestPost session={session?.session ?? null} />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
