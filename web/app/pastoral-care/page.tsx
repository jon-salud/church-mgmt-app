import { api } from "@/lib/api.server";
import { auth0 } from "@/lib/auth0.server";
import { PastoralCareClientPage } from "./client-page";

export default auth0.withPageAuthRequired(async function PastoralCareDashboard() {
    const tickets = await api.getPastoralCareTickets();
    return <PastoralCareClientPage tickets={tickets} />;
}, { returnTo: "/pastoral-care" });
