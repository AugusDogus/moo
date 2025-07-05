import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

import { DeleteAccountButton } from "~/components/auth/delete-account-button";
import { Footer } from "~/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { auth } from "~/lib/auth/server";

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <>
      <main className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl">
            <div className="mb-12 text-center">
              <h1 className="text-foreground mb-4 font-serif text-4xl font-bold tracking-tight">
                Account Settings
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your account and privacy settings
              </p>
            </div>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    {session.user.image && (
                      <Image
                        src={session.user.image}
                        alt="Profile"
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold">
                        {session.user.name}
                      </h3>
                      <p className="text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Your profile information is managed through Discord. To
                    update your name or avatar, please update your Discord
                    profile.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Privacy & Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    We collect minimal data to provide the gaming experience.
                    For more details, please review our{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                    .
                  </p>
                  <p className="text-muted-foreground">
                    You can request your data or delete your account at any
                    time.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Terms of Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    By using moo, you agree to our{" "}
                    <a href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </a>
                    . Please review them to understand your rights and
                    responsibilities.
                  </p>
                </CardContent>
              </Card>

              <DeleteAccountButton />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
