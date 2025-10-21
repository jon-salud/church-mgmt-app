import { api } from "@/lib/api.server";
import { PastoralCareClientPage } from "./client-page";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PastoralCareDashboard() {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("session_token")?.value;
    const demoToken = cookieStore.get("demo_token")?.value;

    if (!sessionToken && !demoToken) {
        redirect("/login?returnTo=/pastoral-care");
    }

    const tickets = await api.getPastoralCareTickets();
    return <PastoralCareClientPage tickets={tickets} />;
}
