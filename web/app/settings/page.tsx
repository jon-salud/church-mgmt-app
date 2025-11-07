import { redirect } from 'next/navigation';
import { api } from '@/lib/api.server';
import { SettingsForm } from './settings-form';
import { ThemeSettings } from './theme-settings';
import { PageHeader } from '@/components/ui-flowbite/page-header';
import { getUserTheme } from '@/app/actions/theme';

export default async function SettingsPage() {
  const me = await api.currentUser();
  if (!me?.user) {
    redirect('/api/auth/login');
  }

  const churchId = me.user.roles[0]?.churchId;
  if (!churchId) {
    redirect('/');
  }

  // Get user theme preferences
  const userTheme = await getUserTheme();

  // Get settings data
  const settings = await api.getSettings(churchId);
  const requestTypes = settings?.requestTypes || [];

  return (
    <div className="container mx-auto py-6">
      <PageHeader title="Settings" />

      {/* User Preferences Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-primary">User Preferences</h2>
        <ThemeSettings initialTheme={userTheme} />
      </div>

      {/* Church Settings Section */}
      <div className="grid gap-6">
        <h2 className="text-xl font-semibold text-primary">Church Settings</h2>
        <SettingsForm
          initialRequestTypes={requestTypes}
          initialSettings={settings}
          churchId={churchId}
        />
      </div>
    </div>
  );
}
