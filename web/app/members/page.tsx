import { api } from '../../lib/api.server';
import { MembersHubClient } from './members-hub-client';

/**
 * Members Hub Page (Phase 1: Discoverability & Speed)
 * Server component fetches supporting reference data (roles, current user) and
 * defers dynamic member listing to client component which handles search,
 * filters, sorting, pagination via URL-synchronised state.
 */
export default async function MembersPage() {
  const [roles, me, groups] = await Promise.all([api.roles(), api.currentUser(), api.groups()]);
  return <MembersHubClient roles={roles} me={me} groups={groups} />;
}
