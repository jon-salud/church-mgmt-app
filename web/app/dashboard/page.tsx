'use client';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <p className="mb-4">This page can be protected by checking session via /api/auth/me (Auth0 helper).</p>
      <ul className="list-disc pl-6">
        <li>Announcements</li>
        <li>Events this week</li>
        <li>Quick links: People, Groups, Events</li>
      </ul>
      <div className="mt-6 space-x-3">
        <Link href="/api/auth/login?returnTo=/dashboard">Login</Link>
        <Link href="/api/auth/logout">Logout</Link>
      </div>
    </main>
  );
}
