'use client';

import { useState } from 'react';
import { Button } from '@/components/ui-flowbite/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-flowbite/card';
import { Plus, Users, Shield, Settings } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
}

interface RolesStepProps {
  settings: Record<string, unknown>;
  onUpdate: (updates: Record<string, unknown>) => void;
}

const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all church management features',
    permissions: [
      'manage_users',
      'manage_groups',
      'manage_events',
      'manage_settings',
      'view_reports',
    ],
    isDefault: true,
  },
  {
    id: 'pastor',
    name: 'Pastor',
    description: 'Leadership role with access to member data and pastoral care',
    permissions: ['view_members', 'manage_groups', 'manage_events', 'pastoral_care'],
    isDefault: true,
  },
  {
    id: 'staff',
    name: 'Staff Member',
    description: 'Church staff with access to operational features',
    permissions: ['view_members', 'manage_events', 'manage_groups'],
    isDefault: true,
  },
  {
    id: 'member',
    name: 'Member',
    description: 'Regular church member with basic access',
    permissions: ['view_public_events', 'view_groups'],
    isDefault: true,
  },
];

export function RolesStep({ settings, onUpdate }: RolesStepProps) {
  const [customRoles, setCustomRoles] = useState<Role[]>((settings.customRoles as Role[]) || []);

  const handleSave = () => {
    onUpdate({ customRoles });
  };

  const addCustomRole = () => {
    const newRole: Role = {
      id: `custom-${Date.now()}`,
      name: 'New Role',
      description: 'Custom role description',
      permissions: [],
      isDefault: false,
    };
    setCustomRoles([...customRoles, newRole]);
  };

  const updateCustomRole = (index: number, updates: Partial<Role>) => {
    const updated = [...customRoles];
    updated[index] = { ...updated[index], ...updates };
    setCustomRoles(updated);
  };

  const removeCustomRole = (index: number) => {
    setCustomRoles(customRoles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Default Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {DEFAULT_ROLES.map(role => (
              <Card key={role.id} className="border-2 border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{role.name}</h4>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      Default
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map(permission => (
                      <span
                        key={permission}
                        className="px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="px-2 py-1 text-xs border border-gray-300 rounded">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Custom Roles
            </div>
            <Button onClick={addCustomRole} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customRoles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No custom roles created yet</p>
              <p className="text-sm">Add custom roles to fit your church's specific needs</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customRoles.map((role, index) => (
                <Card key={role.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={role.name}
                          onChange={e => updateCustomRole(index, { name: e.target.value })}
                          className="font-semibold border-none p-0 bg-transparent focus:outline-none focus:ring-0"
                          placeholder="Role name"
                        />
                        <input
                          type="text"
                          value={role.description}
                          onChange={e => updateCustomRole(index, { description: e.target.value })}
                          className="text-sm text-muted-foreground border-none p-0 bg-transparent focus:outline-none focus:ring-0 mt-1"
                          placeholder="Role description"
                        />
                      </div>
                      <Button
                        onClick={() => removeCustomRole(index)}
                        variant="outline"
                        className="text-destructive hover:text-destructive/90"
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleSave} className="w-full max-w-xs">
          Save Roles Configuration
        </Button>
      </div>
    </div>
  );
}
