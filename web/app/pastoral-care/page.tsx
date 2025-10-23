
import { api } from "@/lib/api.server";
import { PastoralCareClientPage } from "./client-page";

import { Request, RequestType } from "@/lib/types";

export default async function PastoralCareDashboard() {
    const tickets = await api.getPastoralCareTickets();
    const requests = await api.get<Request[]>('/requests');

    const combinedData = [
        ...tickets.map((ticket: any) => ({ ...ticket, type: 'Pastoral Care' })),
        ...requests
    ];

    return <PastoralCareClientPage data={combinedData} />;
}
