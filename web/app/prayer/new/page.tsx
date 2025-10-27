import { redirect } from 'next/navigation';
import { api } from '@/lib/api.server';
import { NewPrayerRequestClientPage } from './client-page';

export default async function NewPrayerRequestPage() {
  const me = await api.currentUser();
  if (!me?.user) {
    redirect('/api/auth/login');
  }

  return <NewPrayerRequestClientPage />;
}
