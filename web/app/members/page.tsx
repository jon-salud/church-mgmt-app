import Link from 'next/link';
import { api } from '../../lib/api';

interface MembersPageProps {
  searchParams?: { q?: string };
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const query = searchParams?.q || '';
  const members = await api.members(query);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Member Directory</h1>
          <p className="text-sm text-slate-400">Search and drill into profiles, roles, and group involvement.</p>
        </div>
        <form className="flex gap-2" action="">
          <label htmlFor="member-search" className="sr-only">
            Search members
          </label>
          <input
            id="member-search"
            name="q"
            defaultValue={query}
            placeholder="Search name or email"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500"
          />
          <button className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900">Search</button>
        </form>
      </header>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="min-w-full text-sm" aria-describedby="members-table-caption">
          <caption id="members-table-caption" className="px-4 py-2 text-left text-xs uppercase text-slate-500">
            Members matching the current search query
          </caption>
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th scope="col" className="px-4 py-3">
                Name
              </th>
              <th scope="col" className="px-4 py-3">
                Email
              </th>
              <th scope="col" className="px-4 py-3">
                Role
              </th>
              <th scope="col" className="px-4 py-3">
                Groups
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {members.map(member => (
              <tr key={member.id} className="transition hover:bg-slate-900/70">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/members/${member.id}`} className="hover:underline">
                    {member.profile?.firstName} {member.profile?.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-400">{member.primaryEmail}</td>
                <td className="px-4 py-3 text-slate-300">{member.roles?.[0]?.role ?? 'Member'}</td>
                <td className="px-4 py-3 text-slate-400">
                  {member.groups?.map((g: any) => g.name).join(', ') || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
