'use client';

import { useEffect, useState, useCallback } from 'react';
import { Drawer, DrawerHeader, DrawerBody } from '@/components/ui-flowbite/drawer';
import { Button } from '@/components/ui-flowbite/button';
import { useUrlState } from '@/lib/hooks/use-url-state';
import { EditMemberModal } from './edit-member-modal';

type Member = {
  id: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  primaryEmail: string;
  status: string;
  roles?: Array<{ role: string; roleId: string }>;
  groups?: Array<{ id: string; name: string }>;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function MemberDrawer() {
  const [memberId, setMemberId] = useUrlState('memberId', '');
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchMember = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/users/${id}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch member');
      }
      const data = await response.json();
      setMember(data);
    } catch (err) {
      setError('Failed to load member details. Please try again.');
      console.error('Failed to fetch member:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (memberId) {
      fetchMember(memberId);
    } else {
      setMember(null);
    }
  }, [memberId, fetchMember]);

  const handleClose = () => {
    setMemberId('');
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Refetch member data after successful edit
    if (memberId) {
      fetchMember(memberId);
    }
  };

  return (
    <>
      <Drawer isOpen={!!memberId} onClose={handleClose} position="right" width="min(480px, 90vw)">
        <DrawerHeader>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Member Details</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close drawer"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </DrawerHeader>

        <DrawerBody>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading member details...</div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {!loading && !error && member && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {member.profile?.firstName} {member.profile?.lastName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {member.primaryEmail}
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300 mb-3">
                  Contact Information
                </h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs text-gray-500 dark:text-gray-400">Email</dt>
                    <dd className="text-sm text-gray-900 dark:text-white">{member.primaryEmail}</dd>
                  </div>
                  {member.profile?.phone && (
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400">Phone</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {member.profile.phone}
                      </dd>
                    </div>
                  )}
                  {member.profile?.address && (
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400">Address</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {member.profile.address}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Status and Roles */}
              <div>
                <h4 className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300 mb-3">
                  Member Details
                </h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-xs text-gray-500 dark:text-gray-400">Status</dt>
                    <dd className="text-sm text-gray-900 dark:text-white capitalize">
                      {member.status}
                    </dd>
                  </div>
                  {member.roles && member.roles.length > 0 && (
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400">Roles</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {member.roles.map(r => r.role).join(', ')}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Groups */}
              {member.groups && member.groups.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300 mb-3">
                    Groups
                  </h4>
                  <ul className="space-y-1">
                    {member.groups.map(group => (
                      <li
                        key={group.id}
                        className="text-sm text-gray-900 dark:text-white flex items-center"
                      >
                        <svg
                          className="h-4 w-4 mr-2 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {group.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Notes */}
              {member.notes && (
                <div>
                  <h4 className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300 mb-3">
                    Notes
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {member.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex gap-2">
                <Button variant="primary" onClick={handleEdit} className="flex-1">
                  Edit Member
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = `mailto:${member.primaryEmail}`)}
                  className="flex-1"
                >
                  Send Email
                </Button>
              </div>
            </div>
          )}
        </DrawerBody>
      </Drawer>

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        member={member}
        onSuccess={handleEditSuccess}
      />
    </>
  );
}
