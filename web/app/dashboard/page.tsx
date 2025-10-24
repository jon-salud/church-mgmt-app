import { api } from '../../lib/api.server';
import { format } from 'date-fns';

export default async function DashboardPage() {
  const [summary, overview] = await Promise.all([api.dashboardSummary(), api.dashboardOverview()]);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Snapshot of community health and activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Members"
          value={summary.memberCount}
          helper="Active in this church"
          testId="stat-members"
        />
        <StatCard
          label="Groups"
          value={summary.groupCount}
          helper="Across ministries"
          testId="stat-groups"
        />
        <StatCard
          label="Upcoming events"
          value={summary.upcomingEvents}
          helper="Next 30 days"
          testId="stat-events"
        />
        <StatCard
          label="Giving (30d)"
          value={`$${summary.totalGivingLast30.toFixed(2)}`}
          helper="Recorded manually"
          testId="stat-giving"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Next events">
          {overview.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
          ) : (
            <ul className="space-y-3">
              {overview.events.map(event => (
                <li key={event.id} className="rounded-md border border-border bg-muted/40 p-3">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.startAt), 'EEE d MMM, h:mma')} ·{' '}
                    {event.location || 'TBA'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Unread announcements">
          {overview.announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No announcements to show.</p>
          ) : (
            <ul className="space-y-3">
              {overview.announcements.map(announcement => (
                <li
                  key={announcement.id}
                  className="rounded-md border border-border bg-muted/40 p-3"
                >
                  <p className="font-medium">{announcement.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Published {format(new Date(announcement.publishAt), 'd MMM, h:mma')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Recent contributions">
        {overview.contributions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contributions recorded yet.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Fund</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {overview.contributions.map(item => (
                <tr key={item.id}>
                  <td className="py-2">{format(new Date(item.date), 'd MMM yyyy')}</td>
                  <td className="py-2 font-medium">${item.amount.toFixed(2)}</td>
                  <td className="py-2 text-muted-foreground">{item.fundId || 'General'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </section>
  );
}

function StatCard({
  label,
  value,
  helper,
  testId,
}: {
  label: string;
  value: string | number;
  helper: string;
  testId?: string;
}) {
  return (
    <dl
      data-testid={testId}
      className="rounded-xl border border-border bg-card p-4 shadow-lg shadow-shadow"
    >
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold text-foreground">{value}</dd>
      <dd className="text-xs text-muted-foreground">{helper}</dd>
    </dl>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-lg shadow-shadow">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-4 space-y-3 text-sm text-foreground">{children}</div>
    </section>
  );
}
