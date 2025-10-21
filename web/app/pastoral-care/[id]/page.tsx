import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { api } from '@/lib/api.server';
import { TicketDetailClientPage } from './client-page';

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticket = await api.getPastoralCareTicket(params.id);
  return <TicketDetailClientPage ticket={ticket} />;
}
