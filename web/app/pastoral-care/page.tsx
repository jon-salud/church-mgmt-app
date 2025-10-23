
import { api } from "@/lib/api.server";
import { PastoralCareClientPage } from "./client-page";

import { Request, RequestType } from "@/lib/types";

export default async function PastoralCareDashboard() {
    const tickets = await api.getPastoralCareTickets();
    const requests = await api.get<Request[]>('/requests');
    const requestTypes = await api.get<RequestType[]>('/settings/1/request-types');

    const requestTypeMap = new Map(requestTypes.map(rt => [rt.id, rt.name]));

    const combinedData = [
        ...tickets.map((ticket: any) => ({ ...ticket, type: 'Pastoral Care' })),
        ...requests.map((request: any) => ({ ...request, type: requestTypeMap.get(request.requestTypeId) || request.requestTypeId }))
    ];

    return <PastoralCareClientPage data={combinedData} />;
}
