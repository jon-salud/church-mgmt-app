'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Modal, ConfirmDialog } from '@/components/ui-flowbite/modal';
import { recordContributionAction, updateContributionAction } from '../actions';
import { hasRole } from '@/lib/utils';
import { toast } from '@/lib/toast';
import type { User, Fund, Contribution, GivingSummary, BulkOperationResult } from '@/lib/types';
import { clientApi } from '@/lib/api.client';

type Member = { id: string; profile: { firstName?: string; lastName?: string } };

type GivingClientProps = {
  funds: Fund[];
  deletedFunds: Fund[];
  members: Member[];
  contributions: Contribution[];
  deletedContributions: Contribution[];
  user: User | null;
  summary: GivingSummary;
  csvUrl: string;
};

export function GivingClient({
  funds: initialFunds,
  deletedFunds: _initialDeletedFunds,
  members,
  contributions: initialContributions,
  deletedContributions: initialDeletedContributions,
  user,
  summary,
  csvUrl,
}: GivingClientProps) {
  const memberMap = useMemo(() => new Map(members.map(member => [member.id, member])), [members]);

  // State management for soft delete (contributions only - fund management reserved for future)
  const [contributions, setContributions] = useState(initialContributions);
  const [deletedContributions, setDeletedContributions] = useState(initialDeletedContributions);
  const [showDeletedContributions, setShowDeletedContributions] = useState(false);
  const [selectedContributionIds, setSelectedContributionIds] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });
  const [editContribution, setEditContribution] = useState<Contribution | null>(null);

  const fundMap = useMemo(() => new Map(initialFunds.map(fund => [fund.id, fund])), [initialFunds]);
  const isAdmin = hasRole(user?.roles, 'admin');
  const isLeader = hasRole(user?.roles, 'leader');
  const canManage = isAdmin || isLeader;

  // Handlers for soft delete operations
  const handleArchiveContribution = async (contributionId: string) => {
    const contribution = contributions.find(c => c.id === contributionId);
    if (!contribution) return;

    const member = memberMap.get(contribution.memberId);
    const memberName = member
      ? `${member.profile?.firstName ?? ''} ${member.profile?.lastName ?? ''}`.trim()
      : contribution.memberId;

    setConfirmDialog({
      open: true,
      title: 'Archive Contribution',
      message: `Archive contribution of $${contribution.amount.toFixed(2)} from ${memberName}? It can be restored later.`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        setContributions(prev => prev.filter(c => c.id !== contributionId));
        setDeletedContributions(prev => [
          ...prev,
          { ...contribution, deletedAt: new Date().toISOString() },
        ]);

        try {
          await clientApi.deleteContribution(contributionId);
          toast.success('Contribution archived');
        } catch {
          setContributions(prev => [...prev, contribution]);
          setDeletedContributions(prev => prev.filter(c => c.id !== contributionId));
          toast.error('Failed to archive contribution');
        }
      },
    });
  };

  const handleRestoreContribution = async (contributionId: string) => {
    const contribution = deletedContributions.find(c => c.id === contributionId);
    if (!contribution) return;

    setDeletedContributions(prev => prev.filter(c => c.id !== contributionId));
    setContributions(prev => [...prev, { ...contribution, deletedAt: null }]);

    try {
      await clientApi.undeleteContribution(contributionId);
      toast.success('Contribution restored');
    } catch {
      setDeletedContributions(prev => [...prev, contribution]);
      setContributions(prev => prev.filter(c => c.id !== contributionId));
      toast.error('Failed to restore contribution');
    }
  };

  const handleBulkArchiveContributions = async () => {
    const ids = Array.from(selectedContributionIds);
    if (ids.length === 0) return;

    setConfirmDialog({
      open: true,
      title: 'Archive Contributions',
      message: `Archive ${ids.length} contribution(s)? They can be restored later.`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }));
        const contributionsToArchive = contributions.filter(c => ids.includes(c.id));

        setContributions(prev => prev.filter(c => !ids.includes(c.id)));
        setDeletedContributions(prev => [
          ...prev,
          ...contributionsToArchive.map(c => ({ ...c, deletedAt: new Date().toISOString() })),
        ]);
        setSelectedContributionIds(new Set());

        try {
          const result: BulkOperationResult = await clientApi.bulkDeleteContributions(ids);
          if (result.failed && result.failed.length > 0) {
            toast.warning(
              `Archived ${result.success} contribution(s). ${result.failed.length} failed: ${result.failed.map(f => f.reason).join(', ')}`
            );
            const failedIds = result.failed.map(f => f.id);
            const failedContribs = contributionsToArchive.filter(c => failedIds.includes(c.id));
            setContributions(prev => [...prev, ...failedContribs]);
            setDeletedContributions(prev => prev.filter(c => !failedIds.includes(c.id)));
          } else {
            toast.success(`${result.success} contribution(s) archived`);
          }
        } catch {
          setContributions(prev => [...prev, ...contributionsToArchive]);
          setDeletedContributions(prev => prev.filter(c => !ids.includes(c.id)));
          setSelectedContributionIds(new Set(ids));
          toast.error('Failed to archive contributions');
        }
      },
    });
  };

  const handleBulkRestoreContributions = async () => {
    const ids = Array.from(selectedContributionIds);
    if (ids.length === 0) return;

    const contributionsToRestore = deletedContributions.filter(c => ids.includes(c.id));

    setDeletedContributions(prev => prev.filter(c => !ids.includes(c.id)));
    setContributions(prev => [
      ...prev,
      ...contributionsToRestore.map(c => ({ ...c, deletedAt: null })),
    ]);
    setSelectedContributionIds(new Set());

    try {
      const result: BulkOperationResult = await clientApi.bulkUndeleteContributions(ids);
      if (result.failed && result.failed.length > 0) {
        toast.warning(
          `Restored ${result.success} contribution(s). ${result.failed.length} failed: ${result.failed.map(f => f.reason).join(', ')}`
        );
        const failedIds = result.failed.map(f => f.id);
        const failedContribs = contributionsToRestore.filter(c => failedIds.includes(c.id));
        setDeletedContributions(prev => [...prev, ...failedContribs]);
        setContributions(prev => prev.filter(c => !failedIds.includes(c.id)));
      } else {
        toast.success(`${result.success} contribution(s) restored`);
      }
    } catch {
      setDeletedContributions(prev => [...prev, ...contributionsToRestore]);
      setContributions(prev => prev.filter(c => !ids.includes(c.id)));
      setSelectedContributionIds(new Set(ids));
      toast.error('Failed to restore contributions');
    }
  };

  // Computed values
  const displayedContributions = showDeletedContributions ? deletedContributions : contributions;
  const allContributionIds = displayedContributions.map(c => c.id);
  const allContributionsSelected =
    allContributionIds.length > 0 &&
    allContributionIds.every(id => selectedContributionIds.has(id));

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Giving records</h1>
          <p className="text-sm text-muted-foreground">
            Track gifts, edit entries, and export summaries for finance reconciliation.
          </p>
        </div>
        <div className="flex gap-2">
          {canManage && deletedContributions.length > 0 && (
            <button
              id="toggle-archived-contributions-button"
              type="button"
              onClick={() => {
                setShowDeletedContributions(!showDeletedContributions);
                setSelectedContributionIds(new Set());
              }}
              className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
            >
              {showDeletedContributions
                ? 'Show Active'
                : `Show Archived (${deletedContributions.length})`}
            </button>
          )}
          <a
            id="download-csv-link"
            href={csvUrl}
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
          >
            Download CSV
          </a>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total giving"
          value={formatCurrency(summary.totals.overall)}
          variant="default"
        />
        <SummaryCard
          label="Month to date"
          value={formatCurrency(summary.totals.monthToDate)}
          variant="emerald"
        />
        <SummaryCard
          label="Previous month"
          value={formatCurrency(summary.totals.previousMonth)}
          variant="amber"
        />
        <SummaryCard
          label="Average gift"
          value={formatCurrency(summary.totals.averageGift || 0)}
          variant="sky"
        />
      </section>

      {/* Bulk operations bar */}
      {canManage && selectedContributionIds.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3">
          <span className="text-sm text-foreground">
            {selectedContributionIds.size} contribution(s) selected
          </span>
          <div className="flex gap-2">
            {showDeletedContributions ? (
              <button
                id="bulk-restore-contributions-button"
                type="button"
                onClick={handleBulkRestoreContributions}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-700"
              >
                Restore Selected
              </button>
            ) : (
              <button
                id="bulk-archive-contributions-button"
                type="button"
                onClick={handleBulkArchiveContributions}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm text-white transition hover:bg-amber-700"
              >
                Archive Selected
              </button>
            )}
            <button
              id="cancel-selection-button"
              type="button"
              onClick={() => setSelectedContributionIds(new Set())}
              className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card/60 p-5">
            <h2 className="text-lg font-semibold">Recent contributions</h2>
            <table className="mt-3 min-w-full text-sm" aria-describedby="contributions-caption">
              <caption
                id="contributions-caption"
                className="text-left text-xs uppercase text-muted-foreground"
              >
                Latest manual giving entries
              </caption>
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  {canManage && (
                    <th scope="col" className="w-12 py-2">
                      <input
                        id="select-all-contributions-checkbox"
                        type="checkbox"
                        checked={allContributionsSelected}
                        onChange={() => {
                          if (allContributionsSelected) {
                            setSelectedContributionIds(new Set());
                          } else {
                            setSelectedContributionIds(new Set(allContributionIds));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                    </th>
                  )}
                  <th scope="col" className="py-2">
                    Date
                  </th>
                  <th scope="col" className="py-2">
                    Member
                  </th>
                  <th scope="col" className="py-2">
                    Fund
                  </th>
                  <th scope="col" className="py-2">
                    Amount
                  </th>
                  <th scope="col" className="py-2">
                    Method
                  </th>
                  <th scope="col" className="py-2">
                    Note
                  </th>
                  <th scope="col" className="py-2">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedContributions.map(entry => {
                  const member = memberMap.get(entry.memberId);
                  const fund = entry.fundId ? fundMap.get(entry.fundId) : undefined;
                  const memberName = member
                    ? `${member.profile?.firstName ?? ''} ${member.profile?.lastName ?? ''}`.trim()
                    : entry.memberId;
                  const isArchived = !!entry.deletedAt;
                  return (
                    <tr key={entry.id} className={isArchived ? 'opacity-60' : ''}>
                      {canManage && (
                        <td className="py-2">
                          <input
                            id={`select-contribution-${entry.id}`}
                            type="checkbox"
                            checked={selectedContributionIds.has(entry.id)}
                            onChange={() => {
                              const newSet = new Set(selectedContributionIds);
                              if (newSet.has(entry.id)) {
                                newSet.delete(entry.id);
                              } else {
                                newSet.add(entry.id);
                              }
                              setSelectedContributionIds(newSet);
                            }}
                            className="rounded border-gray-300"
                          />
                        </td>
                      )}
                      <td className="py-2">{format(new Date(entry.date), 'd MMM yyyy')}</td>
                      <td className="py-2 text-foreground">
                        {memberName || entry.memberId}
                        {isArchived && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                            Archived
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-muted-foreground">{fund?.name ?? 'General'}</td>
                      <td className="py-2 font-medium">{formatCurrency(entry.amount)}</td>
                      <td className="py-2 text-muted-foreground capitalize">
                        {entry.method.replace('-', ' ')}
                      </td>
                      <td className="py-2 text-muted-foreground">{entry.note ?? ''}</td>
                      <td className="py-2 text-right">
                        {canManage && isArchived ? (
                          <button
                            id={`restore-contribution-button-${entry.id}`}
                            type="button"
                            onClick={() => handleRestoreContribution(entry.id)}
                            className="rounded-md border border-emerald-600 px-3 py-1 text-xs text-emerald-600 transition hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                          >
                            Restore
                          </button>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button
                              id={`edit-contribution-button-${entry.id}`}
                              type="button"
                              onClick={() => setEditContribution(entry)}
                              className="rounded-md border border-border px-3 py-1 text-xs text-foreground transition hover:bg-muted"
                            >
                              Edit
                            </button>
                            {canManage && (
                              <button
                                id={`archive-contribution-button-${entry.id}`}
                                type="button"
                                onClick={() => handleArchiveContribution(entry.id)}
                                className="rounded-md border border-amber-600 px-3 py-1 text-xs text-amber-600 transition hover:bg-amber-50 dark:hover:bg-amber-900/20"
                              >
                                Archive
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-5">
            <h2 className="text-lg font-semibold">Record contribution</h2>
            <form action={recordContributionAction} className="mt-3 grid gap-3 text-sm">
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                Member
                <select
                  id="record-member-select"
                  name="memberId"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.profile?.firstName} {member.profile?.lastName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                Amount
                <input
                  id="record-amount-input"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  defaultValue="50"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                Date
                <input
                  id="record-date-input"
                  name="date"
                  type="date"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                Fund
                <select
                  id="record-fund-select"
                  name="fundId"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">General</option>
                  {initialFunds.map(fund => (
                    <option key={fund.id} value={fund.id}>
                      {fund.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                Method
                <select
                  id="record-method-select"
                  name="method"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="cash">Cash</option>
                  <option value="bank-transfer">Bank transfer</option>
                  <option value="eftpos">EFTPOS</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                Note
                <input
                  id="record-note-input"
                  name="note"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder="Optional"
                />
              </label>
              <button
                id="record-save-button"
                className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                Save record
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card/60 p-5">
            <h3 className="text-sm font-semibold text-foreground">Giving by fund</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {summary.byFund.map(entry => (
                <li key={entry.name} className="flex items-center justify-between">
                  <span className="text-foreground">{entry.name}</span>
                  <span className="font-medium">{formatCurrency(entry.amount)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-5">
            <h3 className="text-sm font-semibold text-foreground">Monthly totals</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {summary.monthly.map(entry => (
                <li key={entry.month} className="flex items-center justify-between">
                  <span className="text-foreground">{entry.month}</span>
                  <span className="font-medium">{formatCurrency(entry.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(editContribution)}
        onClose={() => setEditContribution(null)}
        title={
          editContribution
            ? `Edit contribution from ${format(new Date(editContribution.date), 'd MMM yyyy')}`
            : 'Edit contribution'
        }
      >
        {editContribution ? (
          <form
            action={updateContributionAction}
            className="grid gap-3 text-sm"
            onSubmit={() => setEditContribution(null)}
          >
            <input type="hidden" name="contributionId" value={editContribution.id} />
            <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              Member
              <select
                id="edit-member-select"
                name="memberId"
                defaultValue={editContribution.memberId}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.profile?.firstName} {member.profile?.lastName}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                Amount
                <input
                  id="edit-amount-input"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editContribution.amount}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                Date
                <input
                  id="edit-date-input"
                  name="date"
                  type="date"
                  defaultValue={editContribution.date.slice(0, 10)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              Fund
              <select
                id="edit-fund-select"
                name="fundId"
                defaultValue={editContribution.fundId ?? ''}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">General</option>
                {initialFunds.map(fund => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              Method
              <select
                id="edit-method-select"
                name="method"
                defaultValue={editContribution.method}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="bank-transfer">Bank transfer</option>
                <option value="eftpos">EFTPOS</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-wide text-muted-foreground">
              Note
              <input
                id="edit-note-input"
                name="note"
                defaultValue={editContribution.note ?? ''}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Optional"
              />
              <span className="text-[10px] text-muted-foreground">
                Leave blank to remove the note.
              </span>
            </label>
            <button
              id="edit-save-button"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Update contribution
            </button>
          </form>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        variant="warning"
      />
    </section>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  variant?: 'default' | 'emerald' | 'amber' | 'sky';
};

function SummaryCard({ label, value, variant = 'default' }: SummaryCardProps) {
  const variants = {
    default: {
      bg: 'bg-card/60',
      labelColor: 'text-muted-foreground',
    },
    emerald: {
      bg: 'bg-emerald-500/10',
      labelColor: 'text-emerald-800 dark:text-emerald-400',
    },
    amber: {
      bg: 'bg-amber-500/10',
      labelColor: 'text-amber-800 dark:text-amber-400',
    },
    sky: {
      bg: 'bg-sky-500/10',
      labelColor: 'text-sky-800 dark:text-sky-400',
    },
  };
  const selectedVariant = variants[variant];

  return (
    <div className={`rounded-xl border border-border ${selectedVariant.bg} p-4`}>
      <p className={`text-xs uppercase tracking-wide ${selectedVariant.labelColor}`}>{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
