import { recordAttendanceAction } from '../actions';
import { api } from '../../lib/api';
import { format } from 'date-fns';

export default async function EventsPage() {
  const events = await api.events();
  const members = await api.members();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Events & Attendance</h1>
        <p className="text-sm text-slate-400">Record attendance for services, rehearsals, and training.</p>
      </div>

      <div className="space-y-6">
        {events.map(event => (
          <article key={event.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
            <header className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-100">{event.title}</h2>
                <p className="text-xs text-slate-400">
                  {format(new Date(event.startAt), 'EEE d MMM, h:mma')} – {format(new Date(event.endAt), 'h:mma')} ·{' '}
                  {event.location || 'TBA'}
                </p>
              </div>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-xs uppercase tracking-wide text-slate-400">
                {event.visibility}
              </span>
            </header>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Attendance Status</h3>
                <ul className="mt-2 grid gap-2 text-sm">
                  {event.attendance.map((record: any) => (
                    <li key={record.userId} className="flex justify-between rounded-md border border-slate-800 bg-slate-950/60 px-3 py-2">
                      <span>{members.find(m => m.id === record.userId)?.profile?.firstName || record.userId}</span>
                      <span className="text-slate-400">{record.status}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-200">Quick update</h3>
                <form action={recordAttendanceAction} className="mt-2 grid gap-2 text-sm">
                  <input type="hidden" name="eventId" value={event.id} />
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
                    Member
                    <select name="userId" className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                      {members.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.profile?.firstName} {member.profile?.lastName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
                    Status
                    <select name="status" className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                      <option value="checkedIn">Checked-in</option>
                      <option value="absent">Absent</option>
                      <option value="excused">Excused</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-slate-400">
                    Note (optional)
                    <input
                      name="note"
                      className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
                      placeholder="Late arrival, family event, etc."
                    />
                  </label>
                  <button className="rounded-md bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900">Update</button>
                </form>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
