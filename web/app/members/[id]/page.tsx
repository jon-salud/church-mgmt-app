import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '../../../lib/api';
import { format } from 'date-fns';

interface MemberDetailProps {
  params: { id: string };
}

export default async function MemberDetailPage({ params }: MemberDetailProps) {
  const member = await api.member(params.id);
  if (!member) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">
          {member.profile?.firstName} {member.profile?.lastName}
        </h1>
        <p className="text-sm text-slate-400">{member.primaryEmail}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Contact">
          <p className="text-sm text-slate-200">Phone: {member.profile?.phone || '—'}</p>
          <p className="text-sm text-slate-200">Address: {member.profile?.address || '—'}</p>
          <p className="text-xs text-slate-500">Joined: {format(new Date(member.createdAt), 'd MMM yyyy')}</p>
        </InfoCard>
        <InfoCard title="Roles">
          <ul className="text-sm text-slate-200">
            {member.roles?.map((role: any) => (
              <li key={`${role.churchId}-${role.role}`}>{role.role}</li>
            ))}
          </ul>
        </InfoCard>
      </div>

      <InfoCard title="Groups">
        {member.groups?.length ? (
          <ul className="grid gap-2 md:grid-cols-2">
            {member.groups.map((group: any) => (
              <li key={group.id} className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm">
                <p className="font-medium text-slate-100">{group.name}</p>
                <p className="text-xs text-slate-400">Role: {group.role}</p>
                <Link href={`/groups/${group.id}`} className="mt-2 inline-block text-xs text-sky-400 hover:underline">
                  View group
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No groups assigned.</p>
        )}
      </InfoCard>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Attendance (recent)">
          {member.attendance?.length ? (
            <ul className="space-y-2 text-sm">
              {member.attendance.slice(0, 5).map((record: any) => (
                <li key={`${record.eventId}-${record.startAt}`} className="flex justify-between">
                  <span>{record.title}</span>
                  <span className="text-slate-400">{record.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No attendance yet.</p>
          )}
        </InfoCard>
        <InfoCard title="Contributions">
          {member.contributions?.length ? (
            <ul className="space-y-2 text-sm">
              {member.contributions.slice(0, 5).map((entry: any) => (
                <li key={entry.contributionId} className="flex justify-between">
                  <span>{format(new Date(entry.date), 'd MMM')}</span>
                  <span>${entry.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No contributions on record.</p>
          )}
        </InfoCard>
      </div>
    </section>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 shadow-lg shadow-slate-950/40">
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}
