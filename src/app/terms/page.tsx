import { Footer } from "~/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="bg-background flex min-h-[100dvh] flex-col">
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h1 className="text-foreground mb-4 font-serif text-4xl font-bold tracking-tight">
                Terms of Service
              </h1>
              <p className="text-muted-foreground text-lg">
                Last updated: December 5, 2024
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Acceptance of Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  By accessing and using moo, you accept and agree to be bound
                  by the terms and provision of this agreement. If you do not
                  agree to abide by the above, please do not use this service.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">
                  Description of Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Moo is a multiplayer digital deduction puzzler game where
                  players crack four-emoji codes using bulls and cows feedback.
                  The service allows you to create and join game rooms with
                  other players.
                </p>
                <p className="text-muted-foreground">
                  The game is provided free of charge and is designed to be a
                  fun, cozy cottage-core themed gaming experience.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">User Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  To use moo, you must sign in through Discord. By creating an
                  account, you agree to:
                </p>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Provide accurate and complete information</li>
                  <li>• Maintain the security of your account</li>
                  <li>
                    • Accept responsibility for all activities under your
                    account
                  </li>
                  <li>• Notify us immediately of any unauthorized use</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Acceptable Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  You agree to use moo in a respectful manner. You may not:
                </p>
                <ul className="text-muted-foreground space-y-2">
                  <li>
                    • Use the service for any illegal or unauthorized purpose
                  </li>
                  <li>• Harass, abuse, or harm other players</li>
                  <li>• Attempt to disrupt or damage the service</li>
                  <li>• Use automated scripts or bots to play the game</li>
                  <li>• Share inappropriate content or language</li>
                  <li>• Impersonate other users or entities</li>
                  <li>• Collect or store personal data of other users</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Privacy and Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Your privacy is important to us. Please review our Privacy
                  Policy to understand how we collect, use, and protect your
                  information.
                </p>
                <p className="text-muted-foreground">
                  You can delete your account at any time, which will
                  permanently remove all your data from our systems.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The moo game, including its design, graphics, text, and code,
                  is protected by copyright and other intellectual property
                  laws. You may not copy, modify, distribute, or create
                  derivative works based on our content without permission.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Service Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We strive to keep moo available 24/7, but we do not guarantee
                  uninterrupted service. We may need to perform maintenance,
                  updates, or temporary shutdowns.
                </p>
                <p className="text-muted-foreground">
                  We reserve the right to modify or discontinue the service at
                  any time with or without notice.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">
                  Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Moo is provided &ldquo;as is&rdquo; without warranties of any
                  kind. We are not liable for any damages arising from your use
                  of the service, including but not limited to direct, indirect,
                  incidental, punitive, or consequential damages.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We may terminate or suspend your account immediately, without
                  prior notice or liability, if you breach these Terms of
                  Service.
                </p>
                <p className="text-muted-foreground">
                  You may also terminate your account at any time by deleting it
                  through your account settings.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We
                  will notify users of any changes by posting the updated terms
                  on this page and updating the &ldquo;Last updated&rdquo; date.
                </p>
                <p className="text-muted-foreground">
                  Your continued use of moo after any changes constitutes
                  acceptance of the new terms.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Governing Law</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  These terms are governed by the laws of the jurisdiction in
                  which the service is operated. Any disputes will be resolved
                  through binding arbitration.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any questions about these Terms of Service, please
                  contact us at{" "}
                  <a
                    href="mailto:moo@augie.gg"
                    className="text-primary hover:underline"
                  >
                    moo@augie.gg
                  </a>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
