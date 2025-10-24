import { redirect } from "next/navigation";
import { api } from "@/lib/api.server";
import { SettingsForm } from "./settings-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function SettingsPage() {
    const me = await api.currentUser();
    if (!me?.user) {
        redirect("/api/auth/login");
    }

    const churchId = me.user.roles[0]?.churchId;
    const requestTypes = await api.getRequestTypes(churchId);
    const settings = await api.getSettings(churchId);

    return (
        <main>
            <PageHeader title="Settings" />
            <div className="container mx-auto p-4">
                <SettingsForm initialRequestTypes={requestTypes} initialSettings={settings} churchId={churchId} />
            </div>
        </main>
    );
}
