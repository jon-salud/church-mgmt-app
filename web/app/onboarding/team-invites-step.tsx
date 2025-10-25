'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Mail, User } from 'lucide-react';
import { clientApi } from '@/lib/api.client';

interface TeamInvite {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface TeamInvitesStepProps {
  settings: Record<string, unknown>;
  onUpdate: (updates: Record<string, unknown>) => void;
  onSendInvites: (invites: TeamInvite[]) => Promise<void>;
  churchId: string;
}

const AVAILABLE_ROLES = [
  { id: 'admin', name: 'Administrator' },
  { id: 'pastor', name: 'Pastor' },
  { id: 'staff', name: 'Staff Member' },
  { id: 'member', name: 'Member' },
];

export function TeamInvitesStep({
  settings,
  onUpdate,
  onSendInvites,
  churchId,
}: TeamInvitesStepProps) {
  const [invites, setInvites] = useState<TeamInvite[]>(
    (settings.teamInvites as TeamInvite[]) || []
  );
  const [isSending, setIsSending] = useState(false);

  const addInvite = () => {
    const newInvite: TeamInvite = {
      id: `invite-${Date.now()}`,
      email: '',
      role: 'member',
      name: '',
    };
    setInvites([...invites, newInvite]);
  };

  const updateInvite = (index: number, updates: Partial<TeamInvite>) => {
    const updated = [...invites];
    updated[index] = { ...updated[index], ...updates };
    setInvites(updated);
  };

  const removeInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  const handleSendInvites = async () => {
    const validInvites = invites.filter(invite => invite.email && invite.role);
    if (validInvites.length === 0) return;

    setIsSending(true);
    try {
      // Group invites by role for bulk creation
      const roleGroups = validInvites.reduce(
        (acc, invite) => {
          if (!acc[invite.role]) {
            acc[invite.role] = [];
          }
          acc[invite.role].push(invite.email);
          return acc;
        },
        {} as Record<string, string[]>
      );

      // Send bulk invitations for each role
      const promises = Object.entries(roleGroups).map(([roleId, emails]) =>
        clientApi.bulkCreateInvitations(churchId, emails, roleId, 'team')
      );

      await Promise.all(promises);

      // Update settings to mark invites as sent
      onUpdate({ teamInvites: validInvites });

      // Call the parent callback
      await onSendInvites(validInvites);
    } catch (error) {
      console.error('Failed to send invites:', error);
      throw error; // Re-throw to let parent handle error
    } finally {
      setIsSending(false);
    }
  };

  const canSendInvites = invites.some(invite => invite.email && invite.role);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Invite Team Members
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Send email invitations to your church staff and key members to help set up the system.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {invites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No team members added yet</p>
              <p className="text-sm">Add team members to send invitation emails</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invites.map((invite, index) => (
                <Card key={invite.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label htmlFor={`name-${index}`}>Name (optional)</Label>
                          <Input
                            id={`name-${index}`}
                            type="text"
                            placeholder="John Doe"
                            value={invite.name || ''}
                            onChange={e => updateInvite(index, { name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`email-${index}`}>Email *</Label>
                          <Input
                            id={`email-${index}`}
                            type="email"
                            placeholder="john@example.com"
                            value={invite.email}
                            onChange={e => updateInvite(index, { email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`role-${index}`}>Role *</Label>
                          <Select
                            value={invite.role}
                            onValueChange={value => updateInvite(index, { role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              {AVAILABLE_ROLES.map(role => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        onClick={() => removeInvite(index)}
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={addInvite} variant="outline" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </div>

          {canSendInvites && (
            <div className="pt-4 border-t">
              <Button onClick={handleSendInvites} disabled={isSending} className="w-full">
                {isSending ? (
                  'Sending Invites...'
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send {invites.filter(i => i.email && i.role).length} Invitation
                    {invites.filter(i => i.email && i.role).length !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Invitations will be sent via email with registration links
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
