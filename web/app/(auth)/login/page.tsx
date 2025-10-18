import Link from 'next/link';
import { loginAction } from '../../actions';

const demoAccounts = [
  { email: 'admin@example.com', provider: 'google', role: 'Admin', label: 'Admin (Google)' },
  { email: 'leader@example.com', provider: 'facebook', role: 'Leader', label: 'Leader (Facebook)' },
  { email: 'member1@example.com', provider: 'google', role: 'Member', label: 'Member' },
];

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-slate-950/50">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="text-sm text-slate-400">Demo OAuth flow powered by mock data. Choose a role to explore the console.</p>
      </header>

      <div className="space-y-4">
        {demoAccounts.map(account => (
          <form key={account.email} action={loginAction} className="space-y-2">
            <input type="hidden" name="email" value={account.email} />
            <input type="hidden" name="provider" value={account.provider} />
            <input type="hidden" name="role" value={account.role} />
            <button className="w-full rounded-md bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-white">
              Continue as {account.label}
            </button>
            <p className="text-center text-xs text-slate-500">{account.email}</p>
          </form>
        ))}
      </div>

      <p className="text-center text-xs text-slate-500">
        Or browse without signing in{' '}
        <Link href="/dashboard" className="text-sky-400 hover:underline">
          (uses demo-admin token)
        </Link>
      </p>
    </section>
  );
}
