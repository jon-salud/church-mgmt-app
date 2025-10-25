import { api } from '@/lib/api.static';
import { SettingsForm } from './settings-form';
import { PageHeader } from '@/components/ui/page-header';

export default async function SettingsPage() {
  // For static export, remove authentication and use demo data
  // const me = await api.currentUser();
  // if (!me?.user) {
  //   redirect('/api/auth/login');
  // }

  // const churchId = me.user.roles[0]?.churchId;
  // if (!churchId) {
  //   redirect('/');
  // }

  // Use demo church ID for static export
  const churchId = 'demo-church';

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
