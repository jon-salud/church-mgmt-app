'use client';

import { Button } from '@/components/ui/button';
import { clientApi } from '@/lib/api.client';
import { PrayerRequest } from '@/lib/types';
import { useRouter } from 'next/navigation';

export function PrayerWallClientPage({ prayerRequests }: { prayerRequests: PrayerRequest[] }) {
  const router = useRouter();

  async function handlePray(prayerRequestId: string) {
    await clientApi.post(`/prayer-requests/${prayerRequestId}/pray`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {prayerRequests.map((request) => (
        <div key={request.id} className="p-4 border rounded-md">
          <h2 className="text-xl font-bold">{request.title}</h2>
          <p className="text-gray-700">{request.description}</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-400">{request.prayerCount} people are praying</span>
            <Button onClick={() => handlePray(request.id)}>I'm praying</Button>
          </div>
        </div>
      ))}
    </div>
  );
}
