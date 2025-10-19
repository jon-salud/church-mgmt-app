import { api } from '../../lib/api';
import { RolesClient } from './roles-client';

export default async function RolesPage() {
  const roles = await api.roles();
  return <RolesClient roles={roles} />;
}
