'use client';

import { useState } from 'react';
import { Button } from '@/components/ui-flowbite/button';
import { Checkbox } from '@/components/ui-flowbite/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui-flowbite/dropdown-menu';
import { useConfirm } from '@/lib/hooks/use-confirm';
import { ConfirmDialog } from '@/components/ui-flowbite/modal';
import { ChevronDown } from 'lucide-react';

type GroupOption = {
  id: string;
  name: string;
};

type BulkActionBarProps = {
  members: Array<{ id: string; profile: { firstName: string; lastName: string } }>;
  groups: GroupOption[];
  selectedIds: Set<string>;
  onSelectAll: () => void;
  onAction: (action: 'addToGroup' | 'setStatus' | 'delete', params: any) => Promise<void>;
  isProcessing: boolean;
};

export function BulkActionBar({
  members,
  groups,
  selectedIds,
  onSelectAll,
  onAction,
  isProcessing,
}: BulkActionBarProps) {
  const [confirm, confirmState] = useConfirm();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'invited' | 'inactive'>('active');

  const allSelected = selectedIds.size === members.length && members.length > 0;
  const hasSelection = selectedIds.size > 0;

  const getSelectedMemberNames = (limit: number = 5) => {
    const selectedMembers = members.filter(m => selectedIds.has(m.id));
    const names = selectedMembers
      .slice(0, limit)
      .map(m => `${m.profile.firstName} ${m.profile.lastName}`);
    const remaining = selectedMembers.length - limit;
    if (remaining > 0) {
      return `${names.join(', ')} and ${remaining} more`;
    }
    return names.join(', ');
  };

  const handleBulkAction = async (
    action: 'addToGroup' | 'setStatus' | 'delete',
    actionParams?: { groupId?: string; status?: 'active' | 'invited' | 'inactive' }
  ) => {
    let title = '';
    let message = '';
    let confirmText = 'Confirm';
    let variant: 'info' | 'danger' | 'warning' = 'info';
    // Compute params eagerly to avoid relying on async state updates
    let finalParams: any = {};

    if (action === 'addToGroup') {
      const groupId = actionParams?.groupId || selectedGroupId;
      if (!groupId) {
        return; // No group selected
      }
      const group = groups.find(g => g.id === groupId);
      title = 'Add Members to Group';
      message = `Add ${selectedIds.size} member(s) to "${group?.name}"?\n\n${getSelectedMemberNames()}`;
      confirmText = 'Add to Group';
      variant = 'info';
      finalParams = { groupId };
    } else if (action === 'setStatus') {
      const status = actionParams?.status || selectedStatus;
      title = 'Set Member Status';
      message = `Set status to "${status}" for ${selectedIds.size} member(s)?\n\n${getSelectedMemberNames()}`;
      confirmText = 'Set Status';
      variant = 'warning';
      finalParams = { status };
    } else if (action === 'delete') {
      title = 'Delete Members';
      message = `Are you sure you want to delete ${selectedIds.size} member(s)? This action cannot be undone.\n\n${getSelectedMemberNames()}`;
      confirmText = 'Delete';
      variant = 'danger';
    }

    const confirmed = await confirm({ title, message, confirmText, cancelText: 'Cancel', variant });

    if (confirmed) {
      await onAction(action, finalParams);
    }
  };

  if (!hasSelection) {
    return null; // Don't render if no selection
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-3">
        <Checkbox
          id="select-all-members"
          checked={allSelected}
          onCheckedChange={onSelectAll}
          className="cursor-pointer"
        />
        <label htmlFor="select-all-members" className="text-sm text-muted-foreground">
          {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
        </label>

        <div className="ml-auto flex gap-2">
          {/* Add to Group Action */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isProcessing}>
                Add to Group <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {groups.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">No groups available</div>
              ) : (
                groups.map(group => (
                  <DropdownMenuItem
                    key={group.id}
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      handleBulkAction('addToGroup', { groupId: group.id });
                    }}
                  >
                    {group.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Set Status Action */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isProcessing}>
                Set Status <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStatus('active');
                  handleBulkAction('setStatus', { status: 'active' });
                }}
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStatus('invited');
                  handleBulkAction('setStatus', { status: 'invited' });
                }}
              >
                Invited
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedStatus('inactive');
                  handleBulkAction('setStatus', { status: 'inactive' });
                }}
              >
                Inactive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete Action */}
          <Button
            variant="outline"
            onClick={() => handleBulkAction('delete')}
            disabled={isProcessing}
            className="text-destructive hover:bg-destructive/10"
          >
            {isProcessing ? 'Processing...' : 'Delete'}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmState.isOpen}
        onClose={confirmState.onCancel}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title || ''}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant === 'info' ? 'default' : confirmState.variant || 'default'}
      />
    </>
  );
}
