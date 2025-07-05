import { headers } from "next/headers";

import { auth } from "~/lib/auth/server";
import { HydrateClient } from "~/trpc/server";
import { CreateRoomCard, JoinRoomCard } from "~/components/game/room-controls";
import { SignInButton } from "~/components/auth/sign-in-button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
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
                  A multiplayer digital deduction puzzler
                </p>
                
                <div className="text-4xl">
                  🐮 🥛 🍄 🌸 🌿 🧺
                </div>
              </div>

              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle className="text-center text-lg">Welcome to moo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center text-sm text-muted-foreground">
                    Crack four-emoji codes with bulls and cows feedback in this cozy cottage-core deduction game.
                  </div>
                  
                  <div className="text-center text-sm text-muted-foreground">
                    Sign in to create or join games with friends.
                  </div>
                  
                  <SignInButton />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </HydrateClient>
    );
  }

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
                A multiplayer digital deduction puzzler
              </p>
              
              <div className="text-4xl">
                🐮 🥛 🍄 🌸 🌿 🧺
              </div>
            </div>

            <div className="text-center">
              <p className="text-foreground text-lg font-medium">
                Welcome back, {session.user.name}!
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 w-full max-w-2xl">
              <CreateRoomCard />
              <JoinRoomCard />
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
