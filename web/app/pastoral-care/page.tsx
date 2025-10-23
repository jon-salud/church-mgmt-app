
import { api } from "@/lib/api.server";
import { PastoralCareClientPage } from "./client-page";

// Define the type inline to avoid invalid cross-workspace import
interface MockRequest {
  id: string;
  churchId: string;
  userId: string;
  requestTypeId: string;
  title: string;
  body: string;
  isConfidential: boolean;
  createdAt: string;
  status: 'Pending' | 'In Progress' | 'Closed';
}

export default async function PastoralCareDashboard() {
    const tickets = await api.getPastoralCareTickets();
    const requests = await api.get<MockRequest[]>('/requests');

    const combinedData = [
        ...tickets.map((ticket: any) => ({ ...ticket, type: 'Pastoral Care' })),
        ...requests.map((request: MockRequest) => ({ ...request, type: request.requestTypeId }))
    ];

    return <PastoralCareClientPage data={combinedData} />;
}
