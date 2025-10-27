'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { demoLoginAction } from '../../actions';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';
const DEFAULT_REDIRECT = '/dashboard';

export default function LoginPage() {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  // Check if user is already authenticated on client side
  useEffect(() => {
    const checkAuth = () => {
      const sessionToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('session_token='))
        ?.split('=')[1];

      const demoToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('demo_token='))
        ?.split('=')[1];

      if (
        sessionToken ||
        (demoToken && ['demo-admin', 'demo-leader', 'demo-member'].includes(demoToken))
      ) {
        router.push(DEFAULT_REDIRECT);
      }
    };

    checkAuth();
  }, [router]);

  const created = currentSearchParams?.get('created') === 'true';
  const error = currentSearchParams?.get('error');
  const returnTo = currentSearchParams?.get('returnTo') || DEFAULT_REDIRECT;

  const oauthLinks = [
    {
      label: 'Continue with Google',
      href: `${API_BASE}/auth/google?redirect=${encodeURIComponent(returnTo)}`,
    },
    {
      label: 'Continue with Facebook',
      href: `${API_BASE}/auth/facebook?redirect=${encodeURIComponent(returnTo)}`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <section className="mx-auto max-w-md space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/20">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-foreground">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Use Google or Facebook OAuth to receive a JWT session. First-time sign-ins are
            automatically provisioned as members.
          </p>
          {created && (
            <p className="text-xs text-emerald-500 dark:text-emerald-400">
              Welcome aboard! Your account has been created.
            </p>
          )}
          {error && <p className="text-xs text-red-400">Sign-in failed: {error}</p>}
        </header>

        <div className="space-y-3">
          {oauthLinks.map(link => (
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
          <form action={demoLoginAction} className="space-y-3">
            <input type="hidden" name="returnTo" value={returnTo} />
            <div className="space-y-2">
              <label htmlFor="persona-select" className="block text-xs text-muted-foreground">
                Select demo persona:
              </label>
              <select
                id="persona-select"
                name="persona"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                defaultValue="demo-admin"
              >
                <option value="demo-admin">Admin - Full access to all features</option>
                <option value="demo-leader">Leader - Ministry-focused access</option>
                <option value="demo-member">Member - Basic community access</option>
                <option value="demo-new-admin">New Admin - Limited admin access</option>
              </select>
            </div>
            <button
              id="demo-login-button"
              className="w-full rounded-md border border-border px-4 py-2 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              Explore demo mode
            </button>
          </form>
          <p className="text-xs text-muted-foreground">
            Returning to the console?{' '}
            <Link id="home-link" href="/" className="text-primary underline hover:text-primary/90">
              Head back home.
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
