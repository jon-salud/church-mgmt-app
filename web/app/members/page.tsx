import { api } from '../../lib/api.server';
import { MembersClient } from './members-client';

interface MembersPageProps {
  searchParams?: { q?: string };
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const query = searchParams?.q || '';
  const [members, roles, me] = await Promise.all([
    api.members(query),
    api.roles(),
    api.currentUser(),
  ]);
  return <MembersClient members={members} roles={roles} initialQuery={query} me={me} />;
}
