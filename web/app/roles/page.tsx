import { api } from '../../lib/api.server';
import { RolesClient } from './roles-client';

export default async function RolesPage() {
  const [roles, me] = await Promise.all([api.roles(), api.currentUser()]);
  return <RolesClient roles={roles} me={me} />;
}
