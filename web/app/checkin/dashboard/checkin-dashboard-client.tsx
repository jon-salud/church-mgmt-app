'use client';

import { format } from 'date-fns';

type CheckinDashboardClientProps = {
  pending: any[];
  checkedIn: any[];
};

export function CheckinDashboardClient({ pending, checkedIn }: CheckinDashboardClientProps) {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">Child Check-In</h1>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold">Pending Confirmation</h2>
          <ul className="mt-4 space-y-2">
            {pending.length > 0 ? (
              pending.map((checkin) => (
                <li key={checkin.id} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-100">{checkin.child.fullName}</p>
                    <p className="text-xs text-slate-400">Checked in at: {format(new Date(checkin.checkinTime), "h:mm a")}</p>
                  </div>
                  <button type="button" className="rounded-md bg-sky-500 px-3 py-1 text-xs font-medium text-slate-950 transition hover:bg-sky-400">
                    Confirm
                  </button>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-400">No children pending confirmation.</li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Currently Checked-In</h2>
          <ul className="mt-4 space-y-2">
            {checkedIn.length > 0 ? (
              checkedIn.map((checkin) => (
                <li key={checkin.id} className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-100">{checkin.child.fullName}</p>
                    <p className="text-xs text-slate-400">Confirmed at: {format(new Date(checkin.checkinTime), "h:mm a")}</p>
                  </div>
                  <button type="button" className="rounded-md border border-red-700 px-3 py-1 text-xs font-medium text-red-200 transition hover:bg-red-900/40">
                    Check-Out
                  </button>
                </li>
              ))
            ) : (
              <li className="text-sm text-slate-400">No children currently checked in.</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
