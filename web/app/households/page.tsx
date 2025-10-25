import Link from 'next/link';

export default async function HouseholdsPage() {
  // Demo data for static export
  const households = [
    {
      id: '1',
      name: 'Smith Family',
      memberCount: 4,
    },
    {
      id: '2',
      name: 'Johnson Household',
      memberCount: 2,
    },
    {
      id: '3',
      name: 'Williams Family',
      memberCount: 3,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Households</h1>
      <div className="mt-4">
        <div className="flex flex-col gap-4">
          {households.map(household => (
            <Link
              id={`household-link-${household.id}`}
              key={household.id}
              href={`/households/${household.id}`}
              className="block rounded-lg border border-border p-4 transition hover:bg-muted"
            >
              <h2 className="text-lg font-semibold">{household.name}</h2>
              <p className="text-sm text-muted-foreground">
                {household.memberCount} member{household.memberCount === 1 ? '' : 's'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
