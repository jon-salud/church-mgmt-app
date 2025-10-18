import Link from 'next/link';
import { api } from '../../lib/api';

export default async function GroupsPage() {
  const groups = await api.groups();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Groups & Ministries</h1>
        <p className="text-sm text-slate-400">Track life groups, ministries, and their leaders.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map(group => (
          <Link
            href={`/groups/${group.id}`}
            key={group.id}
            className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-600"
          >
            <h2 className="text-lg font-semibold text-slate-100">{group.name}</h2>
            <p className="text-xs text-slate-400">{group.type}</p>
            <p className="mt-2 text-sm text-slate-300">{group.description || 'No description added yet.'}</p>
            <p className="mt-3 text-xs text-slate-500">
              Meeting: {group.meetingDay || 'TBA'} {group.meetingTime ? `· ${group.meetingTime}` : ''}
            </p>
            <p className="text-xs text-slate-500">Members: {group.members?.length ?? 0}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
