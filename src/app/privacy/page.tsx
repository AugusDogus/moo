import { Footer } from "~/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <>
      <main className="bg-background min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h1 className="text-foreground mb-4 font-serif text-4xl font-bold tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Introduction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Welcome to moo, a multiplayer digital deduction puzzler. This
                  Privacy Policy explains how we collect, use, and protect your
                  information when you use our service.
                </p>
                <p className="text-muted-foreground">
                  We are committed to protecting your privacy and being
                  transparent about how we handle your data.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="mb-2 font-semibold">Account Information</h3>
                  <p className="text-muted-foreground">
                    When you sign in through Discord, we collect your Discord
                    username, avatar, and unique Discord ID to create your
                    account.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Game Data</h3>
                  <p className="text-muted-foreground">
                    We store your game history, room participation, and gameplay
                    statistics to provide the gaming experience.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Technical Information</h3>
                  <p className="text-muted-foreground">
                    We may collect technical information such as your IP
                    address, browser type, and device information for security
                    and performance purposes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="text-muted-foreground space-y-2">
                  <li>• Provide and maintain the game service</li>
                  <li>• Authenticate and identify you in game rooms</li>
                  <li>• Track your game progress and statistics</li>
                  <li>• Communicate with you about the service</li>
                  <li>• Improve and optimize the gaming experience</li>
                  <li>• Ensure security and prevent abuse</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Data Sharing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties. The only exception is when
                  required by law or to protect our rights and safety.
                </p>
                <p className="text-muted-foreground">
                  Your Discord information is only used for authentication
                  purposes and is not shared with other players beyond what you
                  choose to display (such as your username in game rooms).
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Data Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We implement appropriate security measures to protect your
                  personal information against unauthorized access, alteration,
                  disclosure, or destruction.
                </p>
                <p className="text-muted-foreground">
                  However, no method of transmission over the internet or
                  electronic storage is 100% secure. While we strive to use
                  commercially acceptable means to protect your information, we
                  cannot guarantee absolute security.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Your Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">You have the right to:</p>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Access your personal information</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Delete your account and associated data</li>
                  <li>• Withdraw consent for data processing</li>
                  <li>• Request data portability</li>
                </ul>
                <p className="text-muted-foreground">
                  To delete your account, visit your{" "}
                  <a href="/account" className="text-primary hover:underline">
                    account settings
                  </a>
                  . For other data requests or questions, please contact us at{" "}
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

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We retain your personal information for as long as your
                  account is active or as needed to provide you services. You
                  can delete your account at any time, which will permanently
                  remove all your data from our systems.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">
                  Changes to This Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the &ldquo;Last updated&rdquo; date.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please
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
    </>
  );
}
