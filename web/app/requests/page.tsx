import { api } from '@/lib/api.static';
import { RequestForm } from './request-form';
import { PageHeader } from '@/components/ui/page-header';

export default async function RequestsPage() {
  // For static export, remove authentication and use demo data
  // const me = await api.currentUser();
  // if (!me?.user) {
  //   redirect('/api/auth/login');
  // }
  // const churchId = me.user.roles[0]?.churchId;

  // Use demo church ID for static export
  const churchId = 'demo-church';
  const types = await api.getRequestTypes(churchId);
  const activeRequestTypes = types.filter(rt => rt.status === 'active');

  return (
    <div className="container mx-auto p-4">
      <PageHeader title="Requests" />
      <RequestForm initialRequestTypes={activeRequestTypes} churchId={churchId} />
    </div>
  );
}
