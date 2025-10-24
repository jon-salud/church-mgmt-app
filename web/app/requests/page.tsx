import { redirect } from "next/navigation";
import { api } from "@/lib/api.server";
import { RequestForm } from "./request-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function RequestsPage() {
    const me = await api.currentUser();
    if (!me?.user) {
        redirect("/api/auth/login");
    }
    const churchId = me.user.roles[0]?.churchId;
    const types = await api.getRequestTypes(churchId);
    const activeRequestTypes = types.filter((rt) => rt.status === "active");

    return (
        <main>
            <PageHeader title="Requests" />
            <div className="container mx-auto p-4">
                <RequestForm initialRequestTypes={activeRequestTypes} churchId={churchId} />
            </div>
        </main>
    );
}
