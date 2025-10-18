import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <main>
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <p className="mb-2">Sign in using Auth0 social providers (configure in env):</p>
      <div className="space-x-2">
        <Link href="/api/auth/login?returnTo=/dashboard"><Button>Continue with Auth0</Button></Link>
      </div>
    </main>
  );
}
