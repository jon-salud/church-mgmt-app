import Link from 'next/link';
import { api } from '../../lib/api.server';

export default async function GroupsPage() {
  const groups = await api.groups();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Groups & Ministries</h1>
        <p className="text-sm text-muted-foreground">
          Track life groups, ministries, and their leaders.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {groups.map(group => (
          <Link
            id={`group-link-${group.id}`}
            href={`/groups/${group.id}`}
            key={group.id}
            className="rounded-xl border border-border bg-card/60 p-4 transition hover:bg-muted/70"
          >
            <h2 className="text-lg font-semibold text-foreground">{group.name}</h2>
            <p className="text-xs text-muted-foreground">{group.type}</p>
            <p className="mt-2 text-sm text-foreground">
              {group.description || 'No description added yet.'}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              Meeting: {group.meetingDay || 'TBA'}{' '}
              {group.meetingTime ? `· ${group.meetingTime}` : ''}
            </p>
            <p className="text-xs text-muted-foreground">Members: {group.members?.length ?? 0}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
