import { format } from 'date-fns';
import { markAnnouncementReadAction } from '../actions';
import { api } from '../../lib/api';

export default async function AnnouncementsPage() {
  const announcements = await api.announcements();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Announcements</h1>
        <p className="text-sm text-slate-400">Share updates across the church or to specific groups.</p>
      </header>

      <div className="space-y-4">
        {announcements.map(announcement => {
          const reads = announcement.reads ?? [];
          return (
            <article key={announcement.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
              <header className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">{announcement.title}</h2>
                  <p className="text-xs text-slate-400">
                    Published {format(new Date(announcement.publishAt), 'd MMM yyyy, h:mma')}
                  </p>
                </div>
                <form action={markAnnouncementReadAction.bind(null, announcement.id)}>
                  <button className="rounded-md border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-200 hover:bg-slate-800">
                    Mark read
                  </button>
                </form>
              </header>
              <p className="mt-4 text-sm leading-relaxed text-slate-200">{announcement.body}</p>
              <p className="mt-3 text-xs text-slate-500">
                Audience: {announcement.audience === 'all' ? 'Whole church' : `Groups: ${announcement.groupIds?.join(', ')}`}
              </p>
              <p className="text-xs text-slate-500">Reads: {reads.length}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
