import { recordContributionAction } from '../actions';
import { api } from '../../lib/api';
import { format } from 'date-fns';

export default async function GivingPage() {
  const [funds, contributions, members] = await Promise.all([
    api.funds(),
    api.contributions(),
    api.members(),
  ]);

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Giving records</h1>
        <p className="text-sm text-slate-400">Manual entry for gifts, pledges, and fundraising.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold">Recent contributions</h2>
          <table className="mt-3 min-w-full text-sm" aria-describedby="contributions-caption">
            <caption id="contributions-caption" className="text-left text-xs uppercase text-slate-500">
              List of the most recent manual giving entries
            </caption>
            <thead className="text-left text-xs uppercase text-slate-400">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {contributions.map(entry => {
                const member = members.find(m => m.id === entry.memberId);
                const fund = funds.find(f => f.id === entry.fundId);
                return (
                  <tr key={entry.id}>
                    <td className="py-2">{format(new Date(entry.date), 'd MMM yyyy')}</td>
                    <td className="py-2 text-slate-300">
                      {member ? `${member.profile.firstName} ${member.profile.lastName}` : entry.memberId}
                    </td>
                    <td className="py-2 text-slate-400">{fund?.name || 'General'}</td>
                    <td className="py-2 font-medium">${entry.amount.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
          <h2 className="text-lg font-semibold">Record contribution</h2>
          <form action={recordContributionAction} className="mt-3 grid gap-3 text-sm">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
              Member
              <select name="memberId" className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.profile.firstName} {member.profile.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
              Amount
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                defaultValue="50"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
              Date
              <input
                name="date"
                type="date"
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                defaultValue={new Date().toISOString().slice(0, 10)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
              Fund
              <select name="fundId" className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                <option value="">General</option>
                {funds.map(fund => (
                  <option key={fund.id} value={fund.id}>
                    {fund.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
              Method
              <select name="method" className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                <option value="cash">Cash</option>
                <option value="bank-transfer">Bank transfer</option>
                <option value="eftpos">EFTPOS</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
              Note
              <input
                name="note"
                className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                placeholder="Optional"
              />
            </label>
            <button className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900">
              Save record
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
