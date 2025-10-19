import Link from 'next/link';
import { api } from '../../../lib/api';

export default async function HouseholdDetailPage({ params }: { params: { id: string } }) {
  const household = await api.household(params.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">{household.name}</h1>
      <p className="text-sm text-slate-400">{household.address}</p>

      <div className="mt-8">
        <h2 className="text-xl font-bold">Members</h2>
        <div className="mt-4 flex flex-col gap-4">
          {household.members.map((member: any) => (
            <Link
              key={member.id}
              href={`/members/${member.id}`}
              className="block rounded-lg border border-slate-700 p-4 transition hover:bg-slate-800"
            >
              <h3 className="text-lg font-semibold">
                {member.profile.firstName} {member.profile.lastName}
              </h3>
              <p className="text-sm text-slate-400">{member.profile.householdRole}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
