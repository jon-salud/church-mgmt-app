import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '../../../lib/api';
import { format } from 'date-fns';

interface GroupDetailProps {
  params: { id: string };
}

export default async function GroupDetailPage({ params }: GroupDetailProps) {
  const group = await api.group(params.id);
  if (!group) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">{group.name}</h1>
        <p className="text-sm text-slate-400">{group.description || 'No description yet.'}</p>
        <p className="text-xs text-slate-500">
          Meeting {group.meetingDay || 'TBA'} {group.meetingTime && `· ${group.meetingTime}`} • Tags:{' '}
          {group.tags?.join(', ') || 'None'}
        </p>
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <h2 className="text-lg font-semibold">Members</h2>
        <table className="mt-3 min-w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Role</th>
              <th className="py-2">Status</th>
              <th className="py-2">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {group.members?.map((member: any) => (
              <tr key={member.userId}>
                <td className="py-2">
                  <Link href={`/members/${member.user.id}`} className="hover:underline">
                    {member.user.profile.firstName} {member.user.profile.lastName}
                  </Link>
                </td>
                <td className="py-2 text-slate-300">{member.role}</td>
                <td className="py-2 text-slate-400">{member.status}</td>
                <td className="py-2 text-slate-400">{format(new Date(member.joinedAt), 'd MMM yyyy')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
        <h2 className="text-lg font-semibold">Upcoming events</h2>
        {group.events?.length ? (
          <ul className="mt-3 space-y-2 text-sm">
            {group.events.map((event: any) => (
              <li key={event.id} className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-slate-400">
                  {format(new Date(event.startAt), 'd MMM yyyy, h:mma')} · {event.location || 'TBA'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No scheduled events yet.</p>
        )}
      </section>
    </section>
  );
}
