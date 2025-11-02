import { api } from '@/lib/api.server';
import { PastoralCareClientPage } from './client-page';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/ui-flowbite/page-header';

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PastoralCareDashboard() {
  const me = await api.currentUser();
  if (!me?.user) {
    redirect('/api/auth/login');
  }
  const churchId = me.user.roles[0]?.churchId;

  const tickets = await api.getPastoralCareTickets();
  const requests = await api.get<any[]>('/requests');
  const requestTypes = await api.getRequestTypes(churchId);

  const combinedData = [
    ...tickets.map((ticket: any) => ({ ...ticket, type: 'Pastoral Care' })),
    ...requests,
  ];

  return (
    <div>
      <PageHeader title="Pastoral Care" />
      <div className="container mx-auto p-4">
        <PastoralCareClientPage data={combinedData} requestTypes={requestTypes} user={me.user} />
      </div>
    </div>
  );
}
