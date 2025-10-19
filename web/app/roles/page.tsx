import { api } from '../../lib/api.server';
import { RolesClient } from './roles-client';

export default async function RolesPage() {
  const roles = await api.roles();
  return <RolesClient roles={roles} />;
}
