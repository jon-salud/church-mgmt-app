/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '../../lib/api.server';
import { format } from 'date-fns';

export default async function DashboardPage() {
  const [summary, overview, me] = await Promise.all([
    api.dashboardSummary(),
    api.dashboardOverview(),
    api.currentUser(),
  ]);

  const isLeader = me?.user?.roles?.some((role: any) => role?.slug === 'leader') ?? false;

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {isLeader ? 'Ministry Dashboard' : 'Dashboard'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLeader
            ? 'Overview of your ministry activities and pastoral care needs.'
            : 'Snapshot of community health and activity.'}
        </p>
      </div>

      {isLeader ? (
        <LeaderDashboard summary={summary} overview={overview} />
      ) : (
        <AdminDashboard summary={summary} overview={overview} />
      )}
    </section>
  );
}

function LeaderDashboard({ summary, overview }: { summary: any; overview: any }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="My Groups"
          value={summary.groupCount}
          helper="Groups I lead"
          testId="stat-my-groups"
        />
        <StatCard
          label="Active Care Requests"
          value={summary.careRequestCount || 0}
          helper="Need attention"
          testId="stat-care-requests"
        />
        <StatCard
          label="Upcoming Events"
          value={summary.upcomingEvents}
          helper="Next 30 days"
          testId="stat-leader-events"
        />
        <StatCard
          label="Volunteer Needs"
          value={summary.volunteerNeeds || 0}
          helper="Open positions"
          testId="stat-volunteer-needs"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="My Upcoming Events">
          {overview.events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events.</p>
          ) : (
            <ul className="space-y-3">
              {overview.events.map((event: any) => (
                <li key={event.id} className="rounded-md border border-border bg-muted/40 p-3">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.startAt), 'EEE d MMM, h:mma')} ·{' '}
                    {event.location || 'TBA'}
                  </p>
                  {event.volunteerRoles && event.volunteerRoles.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      {event.volunteerRoles.filter((role: any) => role.filled < role.needed).length}{' '}
                      volunteer roles open
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Pastoral Care Updates">
          <p className="text-sm text-muted-foreground">
            Recent pastoral care activity and pending requests will appear here.
          </p>
          {/* TODO: Add pastoral care requests filtered by leader's ministry */}
        </Card>
      </div>

      <Card title="My Groups Overview">
        <p className="text-sm text-muted-foreground">
          Summary of attendance and engagement for groups you lead.
        </p>
        {/* TODO: Add group-specific metrics */}
      </Card>
    </>
  );
}

function AdminDashboard({ summary, overview }: { summary: any; overview: any }) {
  return (
    <>
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
              {overview.events.map((event: any) => (
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
              {overview.announcements.map((announcement: any) => (
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
              {overview.contributions.map((item: any) => (
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
    </>
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
