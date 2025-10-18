import Link from 'next/link';
import { demoLoginAction } from '../../actions';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';
const DEFAULT_REDIRECT = '/dashboard';

const oauthLinks = [
  {
    label: 'Continue with Google',
    href: `${API_BASE}/auth/google?redirect=${encodeURIComponent(DEFAULT_REDIRECT)}`,
  },
  {
    label: 'Continue with Facebook',
    href: `${API_BASE}/auth/facebook?redirect=${encodeURIComponent(DEFAULT_REDIRECT)}`,
  },
];

type LoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const created = searchParams?.created === 'true';
  const error = typeof searchParams?.error === 'string' ? searchParams?.error : undefined;

  return (
    <section className="mx-auto max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/50">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="text-sm text-slate-400">
          Use Google or Facebook OAuth to receive a JWT session. First-time sign-ins are automatically provisioned as members.
        </p>
        {created && <p className="text-xs text-emerald-400">Welcome aboard! Your account has been created.</p>}
        {error && <p className="text-xs text-red-400">Sign-in failed: {error}</p>}
      </header>

      <div className="space-y-3">
        {oauthLinks.map(link => (
          <a
            key={link.href}
            className="block w-full rounded-md bg-slate-100 px-4 py-3 text-center text-sm font-medium text-slate-900 transition hover:bg-white"
            href={link.href}
          >
            {link.label}
          </a>
        ))}
      </div>

      <div className="space-y-2 border-t border-slate-800 pt-4 text-center">
        <p className="text-xs text-slate-500">Need to demo quickly?</p>
        <form action={demoLoginAction} className="space-y-1">
          <button className="w-full rounded-md border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:text-white">
            Explore demo mode (uses seeded admin session)
          </button>
        </form>
        <p className="text-xs text-slate-500">
          Returning to the console?{' '}
          <Link href="/" className="text-sky-400 hover:underline">
            Head back home.
          </Link>
        </p>
      </div>
    </section>
  );
}
