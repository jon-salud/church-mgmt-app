type PermissionDescriptor = {
  key: string;
  label: string;
};

type PermissionGroup = {
  module: string;
  label: string;
  permissions: PermissionDescriptor[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    module: 'people',
    label: 'People',
    permissions: [
      { key: 'people.manage', label: 'Manage people records' },
      { key: 'self.view', label: 'View own profile' },
    ],
  },
  {
    module: 'groups',
    label: 'Groups',
    permissions: [
      { key: 'groups.manage', label: 'Manage all groups' },
      { key: 'groups.own.manage', label: 'Manage assigned groups' },
    ],
  },
  {
    module: 'events',
    label: 'Events',
    permissions: [
      { key: 'events.manage', label: 'Manage all events' },
      { key: 'attendance.record', label: 'Record attendance' },
      { key: 'events.view', label: 'View event schedules' },
    ],
  },
  {
    module: 'announcements',
    label: 'Announcements',
    permissions: [
      { key: 'announcements.manage', label: 'Publish announcements' },
      { key: 'announcements.read', label: 'Read announcements' },
    ],
  },
  {
    module: 'giving',
    label: 'Giving',
    permissions: [
      { key: 'giving.manage', label: 'Manage giving records' },
    ],
  },
  {
    module: 'audit',
    label: 'Audit & Settings',
    permissions: [
      { key: 'audit.read', label: 'View audit log' },
      { key: 'settings.manage', label: 'Manage system settings' },
    ],
  },
];
