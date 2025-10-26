export interface MockInvitation {
  id: string;
  churchId: string;
  email: string;
  roleId?: string; // Optional for member registration invites
  invitationToken: string;
  type: 'team' | 'member'; // team = role-based invite, member = registration invite
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export const mockInvitations: MockInvitation[] = [];
