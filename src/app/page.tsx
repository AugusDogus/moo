import { headers } from "next/headers";

import { SignInButton } from "~/components/auth/sign-in-button";
import { UserMenu } from "~/components/auth/user-menu";
import { CreateRoomCard, JoinRoomCard } from "~/components/game/room-controls";
import { Footer } from "~/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/lib/auth/server";
import { HydrateClient } from "~/trpc/server";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <HydrateClient>
        <div className="bg-background flex min-h-[100dvh] flex-col">
          <main className="flex flex-1">
            <div className="container mx-auto flex flex-1 items-center justify-center px-4 py-16">
              <div className="flex flex-col items-center justify-center gap-12">
                <div className="space-y-4 text-center">
                  <h1 className="text-foreground font-serif text-5xl font-bold tracking-tight sm:text-6xl">
                    <span className="text-primary font-serif">moo</span>
                  </h1>

                  <p className="text-muted-foreground max-w-3xl text-lg">
                    a cozy cottage-core deduction game
                  </p>

                  <div className="text-4xl">🐮 🥛 🍄 🌸 🌿 🧺</div>
                </div>

                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle className="text-center text-lg">
                      Welcome to moo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-muted-foreground text-center text-sm">
                      Crack four-emoji codes with bulls and cows feedback in
                      this cozy cottage-core deduction game.
                    </div>

                    <div className="text-muted-foreground text-center text-sm">
                      Sign in to create or join games with friends.
                    </div>

                    <SignInButton />
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </HydrateClient>
    );
  }

  return (
    <HydrateClient>
      <div className="bg-background flex min-h-[100dvh] flex-col">
        <main className="flex flex-1">
          <div className="container mx-auto flex flex-1 items-center justify-center px-4 py-16">
            <div className="flex flex-col items-center justify-center gap-12">
              <div className="space-y-4 text-center">
                <h1 className="text-foreground font-serif text-5xl font-bold tracking-tight sm:text-6xl">
                  <span className="text-primary font-serif">moo</span>
                </h1>

                <p className="text-muted-foreground max-w-3xl text-lg">
                  a cozy cottage-core deduction game
                </p>

                <div className="text-4xl">🐮 🥛 🍄 🌸 🌿 🧺</div>
              </div>

              <div className="flex justify-center">
                <UserMenu user={session.user} />
              </div>

              <div className="grid w-full max-w-2xl justify-center gap-8 md:grid-cols-2">
                <CreateRoomCard />
                <JoinRoomCard />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </HydrateClient>
  );
}
