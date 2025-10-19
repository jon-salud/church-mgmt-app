import { api } from '../../lib/api';
import { MembersClient } from './members-client';

interface MembersPageProps {
  searchParams?: { q?: string };
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const query = searchParams?.q || '';
  const members = await api.members(query);
  const roles = await api.roles();
  return <MembersClient members={members} roles={roles} initialQuery={query} />;
}
