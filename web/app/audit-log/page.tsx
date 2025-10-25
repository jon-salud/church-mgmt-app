import { format } from 'date-fns';

function formatName(actor?: {
  profile?: { firstName?: string; lastName?: string };
  primaryEmail?: string;
  id: string;
}) {
  if (!actor) {
    return 'Unknown user';
  }
  const first = actor.profile?.firstName ?? '';
  const last = actor.profile?.lastName ?? '';
  const combined = `${first} ${last}`.trim();
  return combined || actor.primaryEmail || actor.id;
}

function formatMetadataValue(value: unknown) {
  if (value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return JSON.stringify(value);
}

export default async function AuditLogPage() {
  // Demo data for static export
  const audit = {
    items: [
      {
        id: '1',
        entity: 'member',
        entityId: '1',
        action: 'create',
        summary: 'Created member John Doe',
        createdAt: '2024-01-10T10:00:00Z',
        actorUserId: 'admin',
        actor: {
          id: 'admin',
          primaryEmail: 'admin@church.org',
          profile: { firstName: 'Admin', lastName: 'User' },
        },
        metadata: { name: 'John Doe', email: 'john.doe@example.com' },
      },
      {
        id: '2',
        entity: 'group',
        entityId: '1',
        action: 'update',
        summary: 'Updated group Worship Team',
        createdAt: '2024-01-09T15:30:00Z',
        actorUserId: 'admin',
        actor: {
          id: 'admin',
          primaryEmail: 'admin@church.org',
          profile: { firstName: 'Admin', lastName: 'User' },
        },
        metadata: { name: 'Worship Team', type: 'ServiceMinistry' },
      },
    ],
    meta: { total: 2, pageSize: 20, page: 1 },
  };

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Review recent administrative activity across members, groups, events, giving, and
          announcements.
        </p>
      </header>

      <div className="rounded-xl border border-border bg-card/60 shadow-lg shadow-black/5">
        {audit.items.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No audit entries found.</div>
        ) : (
          <div
            className="overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label="Audit log entries"
          >
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Summary</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {audit.items.map(log => {
                  const actor = log.actor ?? null;
                  const metadataEntries = Object.entries(log.metadata ?? {});
                  const filteredEntries = metadataEntries.filter(
                    ([, value]) => value !== undefined
                  );
                  return (
                    <tr key={log.id} className="hover:bg-muted/60">
                      <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                        {format(new Date(log.createdAt), 'd MMM yyyy, h:mma')}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="font-medium text-foreground">{log.summary}</p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {log.action}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="font-medium text-foreground">
                          {formatName(actor ?? undefined)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {actor?.primaryEmail ?? log.actorUserId}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="inline-flex rounded bg-muted px-2 py-1 text-xs font-semibold uppercase tracking-wide text-foreground">
                          {log.entity}
                        </span>
                        {log.entityId ? (
                          <p className="mt-1 text-xs text-muted-foreground">{log.entityId}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-foreground">
                        {filteredEntries.length > 0 ? (
                          <ul className="space-y-1">
                            {filteredEntries.map(([key, value]) => (
                              <li key={key}>
                                <span className="text-muted-foreground">{key}:</span>{' '}
                                {formatMetadataValue(value)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-xs text-muted-foreground">Showing {audit.items.length} entries</p>
      </div>
    </section>
  );
}
