import Link from 'next/link';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { api } from '../../lib/api.server';

type AuditLogSearchParams = {
  entity?: string;
  actorUserId?: string;
  entityId?: string;
  from?: string;
  to?: string;
  page?: string;
};

function formatName(actor?: { profile?: { firstName?: string; lastName?: string }; primaryEmail?: string; id: string }) {
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

export default async function AuditLogPage({ searchParams }: { searchParams?: AuditLogSearchParams }) {
  const params = searchParams ?? {};
  const entity = params.entity?.trim() || undefined;
  const actorUserId = params.actorUserId?.trim() || undefined;
  const entityId = params.entityId?.trim() || undefined;
  const from = params.from?.trim() || undefined;
  const to = params.to?.trim() || undefined;
  const pageParam = params.page ? Number.parseInt(params.page, 10) : 1;
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

  const me = await api.currentUser();
  const isAdmin = me?.user?.roles?.some((role: { role: string }) => role.role === 'Admin');
  if (!isAdmin) {
    redirect('/dashboard');
  }

  const audit = await api.auditLogs({
    entity,
    actorUserId,
    entityId,
    from,
    to,
    page,
  });

  const totalPages = Math.max(1, Math.ceil(audit.meta.total / audit.meta.pageSize));
  const baseSearch = new URLSearchParams();
  if (entity) baseSearch.set('entity', entity);
  if (actorUserId) baseSearch.set('actorUserId', actorUserId);
  if (entityId) baseSearch.set('entityId', entityId);
  if (from) baseSearch.set('from', from);
  if (to) baseSearch.set('to', to);
  const baseEntriesObject = Object.fromEntries(baseSearch.entries());

  const hasFilters = Boolean(entity || actorUserId || entityId || from || to);
  const buildHref = (targetPage: number) => {
    const paramsForPage = new URLSearchParams(baseEntriesObject);
    if (targetPage > 1) {
      paramsForPage.set('page', String(targetPage));
    } else {
      paramsForPage.delete('page');
    }
    const query = paramsForPage.toString();
    return query ? `/audit-log?${query}` : '/audit-log';
  };

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Review recent administrative activity across members, groups, events, giving, and announcements.
        </p>
      </header>

      <form className="grid gap-4 md:grid-cols-5" method="get">
        <div className="flex flex-col gap-1">
          <label htmlFor="entity" className="text-xs font-semibold uppercase text-muted-foreground">
            Entity
          </label>
          <input
            id="entity"
            name="entity"
            defaultValue={entity ?? ''}
            placeholder="event | contribution"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="actorUserId" className="text-xs font-semibold uppercase text-muted-foreground">
            Actor ID
          </label>
          <input
            id="actorUserId"
            name="actorUserId"
            defaultValue={actorUserId ?? ''}
            placeholder="user-admin"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="entityId" className="text-xs font-semibold uppercase text-muted-foreground">
            Entity ID
          </label>
          <input
            id="entityId"
            name="entityId"
            defaultValue={entityId ?? ''}
            placeholder="event-sunday-service"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="from" className="text-xs font-semibold uppercase text-muted-foreground">
            From
          </label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={from ?? ''}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="to" className="text-xs font-semibold uppercase text-muted-foreground">
            To
          </label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={to ?? ''}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="md:col-span-5 flex items-center gap-2">
          <button
            id="apply-filters-button"
            type="submit"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Apply Filters
          </button>
          {hasFilters ? (
            <Link
              id="reset-filters-link"
              href="/audit-log"
              className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      <div className="rounded-xl border border-border bg-card/60 shadow-lg shadow-black/5">
        {audit.items.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No audit entries match the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
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
                  const filteredEntries = metadataEntries.filter(([, value]) => value !== undefined);
                  return (
                    <tr key={log.id} className="hover:bg-muted/60">
                      <td className="px-4 py-3 align-top text-xs text-muted-foreground">
                        {format(new Date(log.createdAt), 'd MMM yyyy, h:mma')}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="font-medium text-foreground">{log.summary}</p>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{log.action}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="font-medium text-foreground">{formatName(actor ?? undefined)}</p>
                        <p className="text-xs text-muted-foreground">{actor?.primaryEmail ?? log.actorUserId}</p>
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
                                <span className="text-muted-foreground">{key}:</span> {formatMetadataValue(value)}
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
        <p className="text-xs text-muted-foreground">
          Showing page {audit.meta.page} of {totalPages} · {audit.meta.total} total entries
        </p>
        <div className="flex items-center gap-3">
          {audit.meta.page > 1 ? (
            <Link
              id="previous-page-link"
              href={buildHref(audit.meta.page - 1)}
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              Previous
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground/60">Previous</span>
          )}
          {audit.meta.page < totalPages ? (
            <Link
              id="next-page-link"
              href={buildHref(audit.meta.page + 1)}
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              Next
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground/60">Next</span>
          )}
        </div>
      </div>
    </section>
  );
}
