import Link from 'next/link';

export default async function GroupsPage() {
  // Demo data for static export
  const groups = [
    {
      id: '1',
      name: 'Worship Team',
      type: 'ServiceMinistry',
      description: 'Leading worship services and music ministry',
      meetingDay: 'Sunday',
      meetingTime: '8:00 AM',
      members: Array(8).fill({ id: '1' }),
    },
    {
      id: '2',
      name: 'Youth Ministry',
      type: 'ServiceMinistry',
      description: 'Reaching and discipling teenagers',
      meetingDay: 'Wednesday',
      meetingTime: '6:00 PM',
      members: Array(12).fill({ id: '1' }),
    },
    {
      id: '3',
      name: 'Small Group Alpha',
      type: 'SmallGroup',
      description: 'Bible study and fellowship group',
      meetingDay: 'Thursday',
      meetingTime: '7:00 PM',
      members: Array(6).fill({ id: '1' }),
    },
  ];

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
