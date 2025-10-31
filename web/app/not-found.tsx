'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const runtime = 'edge';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard or show a proper not found page
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">404</h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Page not found</p>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}