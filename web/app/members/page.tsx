import { api } from '../../lib/api';
import { MembersClient } from './members-client';

interface MembersPageProps {
  searchParams?: { q?: string };
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const query = searchParams?.q || '';
  const members = await api.members(query);
  return <MembersClient members={members} initialQuery={query} />;
}
