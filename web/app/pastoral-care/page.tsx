import { api } from "@/lib/api.server";
import { PastoralCareClientPage } from "./client-page";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PastoralCareDashboard() {
    const tickets = await api.getPastoralCareTickets();
    return <PastoralCareClientPage tickets={tickets} />;
}
