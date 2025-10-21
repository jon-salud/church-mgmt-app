import { api } from '@/lib/api.server';
import { auth0 } from '@/lib/auth0.server';
import type { AppRouterPageRouteOpts } from '@auth0/nextjs-auth0/server';
import { notFound } from 'next/navigation';
import { TicketDetailClientPage } from './client-page';

const resolveTicketId = async (
  params?: AppRouterPageRouteOpts['params']
) => {
  const resolvedParams = params ? await params : undefined;
  const idParam = resolvedParams?.id;
  return Array.isArray(idParam) ? idParam[0] : idParam;
};

export default auth0.withPageAuthRequired(
  async function TicketDetailPage({ params }: AppRouterPageRouteOpts) {
    const id = await resolveTicketId(params);
    if (!id) {
      notFound();
    }

    const ticket = await api.getPastoralCareTicket(id);
    return <TicketDetailClientPage ticket={ticket} />;
  },
  {
    returnTo: async ({ params }: AppRouterPageRouteOpts) => {
      const id = await resolveTicketId(params);
      return id ? `/pastoral-care/${id}` : '/pastoral-care';
    },
  }
);
