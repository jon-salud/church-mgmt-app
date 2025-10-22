
import { api } from "@/lib/api.server";
import { PastoralCareClientPage } from "./client-page";

export default async function PastoralCareDashboard() {
    const tickets = await api.getPastoralCareTickets();
    const requests = await api.get('/requests');

    const combinedData = [
        ...tickets.map(ticket => ({ ...ticket, type: 'Pastoral Care' })),
        ...requests.map(request => ({ ...request, type: request.type.charAt(0).toUpperCase() + request.type.slice(1).toLowerCase() }))
    ];

    return <PastoralCareClientPage data={combinedData} />;
}
