import Link from 'next/link';
import { api } from '../../lib/api.server';

export default async function HouseholdsPage() {
  const households = await api.households();

  return (
    <div>
      <h1 className="text-2xl font-bold">Households</h1>
      <div className="mt-4">
        <div className="flex flex-col gap-4">
          {households.map((household: any) => (
            <Link
              id={`household-link-${household.id}`}
              key={household.id}
              href={`/households/${household.id}`}
              className="block rounded-lg border border-slate-700 p-4 transition hover:bg-slate-800"
            >
              <h2 className="text-lg font-semibold">{household.name}</h2>
              <p className="text-sm text-slate-400">
                {household.memberCount} member{household.memberCount === 1 ? '' : 's'}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
