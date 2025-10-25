import { api } from '../../lib/api.server';
import { OnboardingWizard } from './onboarding-wizard';

export default async function OnboardingPage() {
  // NOTE: This authentication check duplicates logic that could be in the layout.
  // However, due to a redirect issue in the root layout (see project docs),
  // this duplication is intentional to prevent redirect loops.
  const me = await api.currentUser();

  if (!me?.user?.churchId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You must be logged in to access onboarding.</p>
        </div>
      </div>
    );
  }

  const settings = await api.getSettings(me.user.churchId);

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard churchId={me.user.churchId} initialSettings={settings} />
    </div>
  );
}
