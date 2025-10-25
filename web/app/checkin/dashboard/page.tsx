import { CheckinDashboardClient } from './checkin-dashboard-client';

export default async function CheckinDashboardPage() {
  // Demo data for static export
  const pending = [
    {
      id: '1',
      child: {
        fullName: 'John Doe',
      },
      checkinTime: '2024-01-14T09:45:00Z',
    },
  ];

  const checkedIn = [
    {
      id: '2',
      child: {
        fullName: 'Jane Smith',
      },
      checkinTime: '2024-01-14T09:45:00Z',
    },
  ];

  return <CheckinDashboardClient pending={pending} checkedIn={checkedIn} />;
}
