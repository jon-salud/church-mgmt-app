import { RolesClient } from './roles-client';

export default async function RolesPage() {
  // Demo data for static export
  const roles = [
    {
      id: 'admin',
      name: 'Admin',
      description: 'Full administrative access',
      permissions: ['*'],
      slug: 'admin',
      isSystem: true,
      isDeletable: false,
      assignmentCount: 2,
    },
    {
      id: 'member',
      name: 'Member',
      description: 'Standard member access',
      permissions: ['read'],
      slug: 'member',
      isSystem: true,
      isDeletable: false,
      assignmentCount: 40,
    },
    {
      id: 'elder',
      name: 'Elder',
      description: 'Church leadership role',
      permissions: ['read', 'write', 'manage_groups'],
      slug: 'elder',
      isSystem: false,
      isDeletable: true,
      assignmentCount: 5,
    },
  ];

  return <RolesClient roles={roles} />;
}
