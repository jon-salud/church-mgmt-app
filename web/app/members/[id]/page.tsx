import { notFound } from 'next/navigation';
import { api } from '../../../lib/api';
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
  return <MemberDetailClient member={member} roles={roles} />;
}
