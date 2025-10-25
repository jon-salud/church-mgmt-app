import Link from 'next/link';

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          This is a demo version of the church management app. Use the demo login to explore
          features.
        </p>
      </header>

      <div className="space-y-2 border-t border-border pt-4 text-center">
        <p className="text-xs text-muted-foreground">Demo Mode</p>
        <form className="space-y-1">
          <input type="hidden" name="returnTo" value="/dashboard" />
          <button
            id="demo-login-button"
            className="w-full rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
          >
            Explore demo mode (uses seeded admin session)
          </button>
        </form>
        <p className="text-xs text-muted-foreground">
          <Link id="home-link" href="/" className="text-primary underline hover:text-primary/90">
            Head back home.
          </Link>
        </p>
      </div>
    </section>
  );
}
