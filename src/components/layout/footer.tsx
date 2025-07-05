export function Footer() {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} moo. A cozy cottage-core deduction
            game.
          </div>
          <div className="flex gap-6 text-sm">
            <a
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="mailto:moo@augie.gg"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Contact Us
            </a>
            <a
              href="https://github.com/AugusDogus/moo"
              className="text-muted-foreground hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
