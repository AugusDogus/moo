import { ExternalLink } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
                Create <span className="text-primary">T3</span> App
              </h1>
              <p className="text-muted-foreground max-w-2xl text-xl">
                A modern full-stack application built with the T3 stack
              </p>
            </div>

            <div className="grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
              <Card className="group transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    First Steps
                    <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardTitle>
                  <CardDescription>
                    Everything you need to know to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Just the basics - Everything you need to know to set up your
                    database and authentication.
                  </p>
                  <Link
                    href="https://create.t3.gg/en/usage/first-steps"
                    target="_blank"
                    className="text-primary hover:text-primary/80 inline-flex items-center transition-colors"
                  >
                    Learn more →
                  </Link>
                </CardContent>
              </Card>

              <Card className="group transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Documentation
                    <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </CardTitle>
                  <CardDescription>
                    Comprehensive guides and references
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Learn more about Create T3 App, the libraries it uses, and
                    how to deploy it.
                  </p>
                  <Link
                    href="https://create.t3.gg/en/introduction"
                    target="_blank"
                    className="text-primary hover:text-primary/80 inline-flex items-center transition-colors"
                  >
                    Read docs →
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-foreground text-lg font-medium">
                {hello ? hello.greeting : "Loading tRPC query..."}
              </p>
            </div>

            <LatestPost session={session?.session ?? null} />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
