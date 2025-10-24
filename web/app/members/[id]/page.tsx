import { notFound } from 'next/navigation';
import { api } from '../../../lib/api.server';
import { MemberDetailClient } from './member-detail-client';

interface MemberDetailProps {
  params: { id: string };
}

export default async function MemberDetailPage({ params }: MemberDetailProps) {
  const member = await api.member(params.id);
  const roles = await api.roles();
  if (!member) {
    notFound();
  }

  const me = await api.currentUser();
  const churchId = me?.user?.roles[0]?.churchId;
  const settings = churchId ? await api.getSettings(churchId) : null;
  const children = member.household?.id ? await api.getChildren(member.household.id) : [];

  const isOwnProfile = me?.user?.id === params.id;
  const prayerRequests = isOwnProfile ? await api.getPrayerRequests() : [];

  return (
    <MemberDetailClient
      member={member}
      roles={roles}
      settings={settings}
      children={children}
      prayerRequests={prayerRequests}
    />
  );
}
