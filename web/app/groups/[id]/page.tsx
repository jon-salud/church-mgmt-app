import { notFound } from 'next/navigation';
import { api } from '../../../lib/api';
import { GroupDetailClient } from './group-detail-client';

interface GroupDetailProps {
  params: { id: string };
}

export default async function GroupDetailPage({ params }: GroupDetailProps) {
  const group = await api.group(params.id);
  if (!group) {
    notFound();
  }
  const members = await api.members();
  return <GroupDetailClient group={group} allMembers={members} />;
}
