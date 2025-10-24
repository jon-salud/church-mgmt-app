import { api } from '@/lib/api.server';
import { getSession } from '@auth0/nextjs-auth0';
import { notFound, redirect } from 'next/navigation';
import { TicketDetailClientPage } from './client-page';

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session) {
    redirect('/api/auth/login');
  }

  const id = params.id;
  if (!id) {
    notFound();
  }

  const ticket = await api.getPastoralCareTicket(id);
  return <TicketDetailClientPage ticket={ticket} />;
}
