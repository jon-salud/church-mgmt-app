import { api } from '../../../lib/api.server';
import { CheckinDashboardClient } from './checkin-dashboard-client';

export default async function CheckinDashboardPage() {
  const pending = await api.getCheckins('pending');
  const checkedIn = await api.getCheckins('checked-in');

  return <CheckinDashboardClient pending={pending} checkedIn={checkedIn} />;
}
