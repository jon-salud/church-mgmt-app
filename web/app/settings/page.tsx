import { redirect } from 'next/navigation';
import { api } from '@/lib/api.server';
import { SettingsForm } from './settings-form';
import { PageHeader } from '@/components/ui/page-header';

export default async function SettingsPage() {
  const me = await api.currentUser();
  if (!me?.user) {
    redirect('/api/auth/login');
  }

  const churchId = me.user.roles[0]?.churchId;
  if (!churchId) {
    redirect('/');
  }

  // Get settings data
  const settings = await api.getSettings(churchId);
  const requestTypes = settings?.requestTypes || [];

  return (
    <div className="container mx-auto py-6">
      <PageHeader title="Settings" />
      <div className="grid gap-6">
        <SettingsForm
          initialRequestTypes={requestTypes}
          initialSettings={settings}
          churchId={churchId}
        />
      </div>
    </div>
  );
}
