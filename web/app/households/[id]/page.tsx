import Link from 'next/link';
import { api } from '../../../lib/api.server';

export default async function HouseholdDetailPage({ params }: { params: { id: string } }) {
  try {
    const household = await api.household(params.id);

    if (!household) {
      return <div>Household not found</div>;
    }

    return (
      <div>
        <h1 className="text-2xl font-bold">{household.name}</h1>
        <p className="text-sm text-muted-foreground">{household.address}</p>

        <div className="mt-8">
          <h2 className="text-xl font-bold">Members</h2>
          <div className="mt-4 flex flex-col gap-4">
            {household.members?.length ? (
              household.members.map((member: any) => (
                <Link
                  id={`member-link-${member.id}`}
                  key={member.id}
                  href={`/members/${member.id}`}
                  className="block rounded-lg border border-border p-4 transition hover:bg-muted"
                >
                  <h3 className="text-lg font-semibold">
                    {member.profile?.firstName} {member.profile?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{member.profile?.householdRole}</p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No members in this household.</p>
            )}
          </div>
        </div>
      </div>
    );
  } catch {
    return (
      <div>
        Unable to load household details. Please try again or contact support if the problem
        persists.
      </div>
    );
  }
}
