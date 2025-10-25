import Link from 'next/link';

export async function generateStaticParams() {
  // For static export, we need to provide all possible household IDs
  // In a real deployment, this would fetch from your database
  return [{ id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }];
}

export default async function HouseholdDetailPage({ params }: { params: { id: string } }) {
  // Demo data for static export
  const demoHouseholds = {
    '1': {
      id: '1',
      name: 'Smith Family',
      address: '123 Main St, Anytown, USA',
      members: [
        { id: '1', profile: { firstName: 'John', lastName: 'Smith' } },
        { id: '2', profile: { firstName: 'Jane', lastName: 'Smith' } },
      ],
    },
    '2': {
      id: '2',
      name: 'Johnson Family',
      address: '456 Oak Ave, Somewhere, USA',
      members: [{ id: '3', profile: { firstName: 'Bob', lastName: 'Johnson' } }],
    },
    '3': {
      id: '3',
      name: 'Davis Family',
      address: '789 Pine Rd, Elsewhere, USA',
      members: [
        { id: '4', profile: { firstName: 'Alice', lastName: 'Davis' } },
        { id: '5', profile: { firstName: 'Charlie', lastName: 'Davis' } },
      ],
    },
    '4': {
      id: '4',
      name: 'Wilson Family',
      address: '321 Elm St, Nowhere, USA',
      members: [{ id: '6', profile: { firstName: 'David', lastName: 'Wilson' } }],
    },
    '5': {
      id: '5',
      name: 'Brown Family',
      address: '654 Maple Dr, Anywhere, USA',
      members: [
        { id: '7', profile: { firstName: 'Eva', lastName: 'Brown' } },
        { id: '8', profile: { firstName: 'Frank', lastName: 'Brown' } },
        { id: '9', profile: { firstName: 'Grace', lastName: 'Brown' } },
      ],
    },
  };

  const household = demoHouseholds[params.id as keyof typeof demoHouseholds];
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
          {household.members.map((member: any) => (
            <Link
              id={`member-link-${member.id}`}
              key={member.id}
              href={`/members/${member.id}`}
              className="block rounded-lg border border-border p-4 transition hover:bg-muted"
            >
              <h3 className="text-lg font-semibold">
                {member.profile.firstName} {member.profile.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{member.profile.householdRole}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
