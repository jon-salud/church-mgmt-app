'use client';

import { Button } from '@/components/ui-flowbite/button';
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
      {prayerRequests.map(request => (
        <div
          key={request.id}
          className="p-5 border border-border bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <h2 className="heading-2">{request.title}</h2>
          <p className="text-foreground">{request.description}</p>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              {request.prayerCount} people are praying
            </span>
            <Button id={`pray-button-${request.id}`} onClick={() => handlePray(request.id)}>
              I'm praying
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
