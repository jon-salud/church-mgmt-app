import Link from "next/link";
import { demoLoginAction } from "../../actions";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";
const DEFAULT_REDIRECT = "/dashboard";

type LoginPageProps = {
    searchParams?: Record<string, string | string[] | undefined>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
    const created = searchParams?.created === "true";
    const error = typeof searchParams?.error === "string" ? searchParams?.error : undefined;
    const returnTo = typeof searchParams?.returnTo === "string" ? searchParams.returnTo : DEFAULT_REDIRECT;

    const oauthLinks = [
        {
            label: "Continue with Google",
            href: `${API_BASE}/auth/google?redirect=${encodeURIComponent(returnTo)}`,
        },
        {
            label: "Continue with Facebook",
            href: `${API_BASE}/auth/facebook?redirect=${encodeURIComponent(returnTo)}`,
        },
    ];

    return (
        <section className="mx-auto max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20">
            <header className="space-y-2 text-center">
                <h1 className="text-3xl font-semibold text-foreground">Sign in</h1>
                <p className="text-sm text-muted-foreground">Use Google or Facebook OAuth to receive a JWT session. First-time sign-ins are automatically provisioned as members.</p>
                {created && <p className="text-xs text-emerald-500 dark:text-emerald-400">Welcome aboard! Your account has been created.</p>}
                {error && <p className="text-xs text-red-400">Sign-in failed: {error}</p>}
            </header>

            <div className="space-y-3">
                {oauthLinks.map((link) => (
                    <a
                        id={`oauth-link-${link.label.toLowerCase().replace(' ', '-')}`}
                        key={link.href}
                        className="block w-full rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        href={link.href}
                    >
                        {link.label}
                    </a>
                ))}
            </div>

            <div className="space-y-2 border-t border-border pt-4 text-center">
                <p className="text-xs text-muted-foreground">Need to demo quickly?</p>
                <form action={demoLoginAction} className="space-y-1">
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <button
                        id="demo-login-button"
                        className="w-full rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
                    >
                        Explore demo mode (uses seeded admin session)
                    </button>
                </form>
                <p className="text-xs text-muted-foreground">
                    Returning to the console?{" "}
                    <Link id="home-link" href="/" className="text-primary underline hover:text-primary/90">
                        Head back home.
                    </Link>
                </p>
            </div>
        </section>
    );
}
