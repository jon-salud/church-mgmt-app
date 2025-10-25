'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Modal } from '../../components/ui/modal';

type Fund = { id: string; name: string };
type Member = { id: string; profile: { firstName?: string; lastName?: string } };
type Contribution = {
  id: string;
  memberId: string;
  amount: number;
  date: string;
  fundId?: string | null;
  method: string;
  note?: string | null;
};

type GivingSummary = {
  totals: { overall: number; monthToDate: number; previousMonth: number; averageGift: number };
  byFund: Array<{ fundId: string | null; name: string; amount: number }>;
  monthly: Array<{ month: string; amount: number }>;
};

type GivingClientProps = {
  funds: Fund[];
  members: Member[];
  contributions: Contribution[];
  summary: GivingSummary;
  csvUrl: string;
};

export function GivingClient({
  funds,
  members,
  contributions,
  summary,
  csvUrl,
}: GivingClientProps) {
  const memberMap = useMemo(() => new Map(members.map(member => [member.id, member])), [members]);
  const fundMap = useMemo(() => new Map(funds.map(fund => [fund.id, fund])), [funds]);
  const [editContribution, setEditContribution] = useState<Contribution | null>(null);

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
        <a
          id="download-csv-link"
          href={csvUrl}
          className="rounded-md border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted"
        >
          Download CSV
        </a>
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
                {contributions.map(entry => {
                  const member = memberMap.get(entry.memberId);
                  const fund = entry.fundId ? fundMap.get(entry.fundId) : undefined;
                  const memberName = member
                    ? `${member.profile?.firstName ?? ''} ${member.profile?.lastName ?? ''}`.trim()
                    : entry.memberId;
                  return (
                    <tr key={entry.id}>
                      <td className="py-2">{format(new Date(entry.date), 'd MMM yyyy')}</td>
                      <td className="py-2 text-foreground">{memberName || entry.memberId}</td>
                      <td className="py-2 text-muted-foreground">{fund?.name ?? 'General'}</td>
                      <td className="py-2 font-medium">{formatCurrency(entry.amount)}</td>
                      <td className="py-2 text-muted-foreground capitalize">
                        {entry.method.replace('-', ' ')}
                      </td>
                      <td className="py-2 text-muted-foreground">{entry.note ?? ''}</td>
                      <td className="py-2 text-right">
                        <button
                          id={`edit-contribution-button-${entry.id}`}
                          type="button"
                          onClick={() => setEditContribution(entry)}
                          className="rounded-md border border-border px-3 py-1 text-xs text-foreground transition hover:bg-muted"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card/60 p-5">
            <h2 className="text-lg font-semibold">Record contribution</h2>
            <form className="mt-3 grid gap-3 text-sm">
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
                  {funds.map(fund => (
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
          <form className="grid gap-3 text-sm" onSubmit={() => setEditContribution(null)}>
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
                {funds.map(fund => (
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
