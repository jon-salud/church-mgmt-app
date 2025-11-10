'use client';

import { Drawer } from '@/components/ui-flowbite/drawer';
import { MemberSummary } from '@/lib/api/members';
import { Mail, Phone, Users, Calendar } from 'lucide-react';

interface MemberDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberSummary | null;
  onEdit?: (member: MemberSummary) => void;
}

export function MemberDetailDrawer({ isOpen, onClose, member, onEdit }: MemberDetailDrawerProps) {
  if (!member) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} width="lg" title="Member Details">
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">
            {member.firstName} {member.lastName}
          </h2>
          <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {member.status}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Contact</h3>
          <div className="space-y-2">
            {member.email && (
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${member.email}`} className="hover:underline">
                  {member.email}
                </a>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${member.phone}`} className="hover:underline">
                  {member.phone}
                </a>
              </div>
            )}
            {!member.email && !member.phone && (
              <p className="text-sm text-muted-foreground">No contact information</p>
            )}
          </div>
        </div>

        {/* Roles */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Roles</h3>
          {member.roles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {member.roles.map(role => (
                <span
                  key={role}
                  className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-sm font-medium"
                >
                  {role}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No roles assigned</p>
          )}
        </div>

        {/* Groups */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Groups</h3>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              {member.groupsCount} group{member.groupsCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Last Attendance */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Attendance</h3>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{member.lastAttendance || 'No attendance recorded'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => onEdit?.(member)}
            className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Edit Member
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Close
          </button>
        </div>
      </div>
    </Drawer>
  );
}
