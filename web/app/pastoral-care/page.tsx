import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { api } from '@/lib/api.server';
import { PastoralCareClientPage } from './client-page';

export default withPageAuthRequired(
  async function PastoralCareDashboard() {
    const tickets = await api.getPastoralCareTickets();
    return <PastoralCareClientPage tickets={tickets} />;
  },
  { returnTo: '/pastoral-care' },
);
