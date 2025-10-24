'use client';

import { Button } from '@/components/ui/button';
import { clientApi } from '@/lib/api.client';
import { PrayerRequest } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function PrayerAdminClientPage({ prayerRequests }: { prayerRequests: PrayerRequest[] }) {
  const router = useRouter();

  async function handleApprove(prayerRequestId: string) {
    await clientApi.put(`/prayer-requests/${prayerRequestId}/status`, { status: 'Approved' });
    router.refresh();
  }

  async function handleDeny(prayerRequestId: string) {
    await clientApi.put(`/prayer-requests/${prayerRequestId}/status`, { status: 'Denied' });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {prayerRequests.map(request => (
        <div key={request.id} className="p-4 border rounded-md">
          <h2 className="text-xl font-bold">{request.title}</h2>
          <p className="text-gray-700">{request.description}</p>
          <div className="flex items-center justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => handleDeny(request.id)}>
              Deny
            </Button>
            <Button onClick={() => handleApprove(request.id)}>Approve</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
