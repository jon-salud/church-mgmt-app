"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, postToApi, apiFetch } from "../lib/api.server";

const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api/v1";

export async function logoutAction() {
    const cookieStore = cookies();
    cookieStore.delete("session_token");
    cookieStore.delete("session_provider");
    cookieStore.delete("demo_token");
    cookieStore.delete("demo_user_email");
    redirect("/(auth)/login");
}

export async function markAnnouncementReadAction(id: string) {
    await postToApi(`/announcements/${id}/read`);
    revalidatePath("/announcements");
    revalidatePath("/dashboard");
}

const toIsoString = (value: string | undefined | null) => {
    if (!value) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }
    return date.toISOString();
};

export async function createAnnouncementAction(formData: FormData) {
    const audience = (formData.get("audience") as "all" | "custom") || "all";
    const publishInput = formData.get("publishAt") ? String(formData.get("publishAt")) : undefined;
    const expireInput = formData.get("expireAt") ? String(formData.get("expireAt")) : undefined;
    const payload: Record<string, unknown> = {
        title: String(formData.get("title") ?? ""),
        body: String(formData.get("body") ?? ""),
        audience,
        publishAt: toIsoString(publishInput) ?? new Date().toISOString(),
    };
    const expireIso = toIsoString(expireInput);
    if (expireIso) {
        payload.expireAt = expireIso;
    }
    if (audience === "custom") {
        const groupIds = formData
            .getAll("groupIds")
            .map((value) => String(value))
            .filter(Boolean);
        payload.groupIds = groupIds;
    }
    await postToApi("/announcements", payload);
    revalidatePath("/announcements");
    revalidatePath("/dashboard");
}

export async function updateAnnouncementAction(formData: FormData) {
    const announcementId = String(formData.get("announcementId"));
    const payload: Record<string, unknown> = {};
    const entries: Array<[string, FormDataEntryValue | null]> = [
        ["title", formData.get("title")],
        ["body", formData.get("body")],
    ];
    for (const [key, value] of entries) {
        if (value !== null) {
            const text = String(value);
            if (text.length > 0) {
                payload[key] = text;
            }
        }
    }

    const audienceRaw = formData.get("audience");
    const audience = audienceRaw ? String(audienceRaw) : undefined;
    if (audience) {
        payload.audience = audience;
    }

    const publishAtRaw = formData.get("publishAt");
    if (publishAtRaw) {
        const publishIso = toIsoString(String(publishAtRaw));
        if (publishIso) {
            payload.publishAt = publishIso;
        }
    }

    if (formData.has("expireAt")) {
        const expireValue = formData.get("expireAt");
        if (expireValue === null) {
            // no-op
        } else {
            const expireText = String(expireValue);
            if (expireText === "") {
                payload.expireAt = null;
            } else {
                const expireIso = toIsoString(expireText);
                if (expireIso) {
                    payload.expireAt = expireIso;
                }
            }
        }
    }

    const groupIds = formData
        .getAll("groupIds")
        .map((value) => String(value))
        .filter(Boolean);
    const groupFieldTouched = formData.has("groupIdsMarker");
    if (audience === "custom") {
        payload.groupIds = groupIds;
    } else if (audience && audience !== "custom") {
        payload.groupIds = [];
    } else if (groupFieldTouched) {
        payload.groupIds = groupIds;
    }

    await apiFetch(`/announcements/${announcementId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    revalidatePath("/announcements");
    revalidatePath("/dashboard");
}

export async function recordAttendanceAction(formData: FormData) {
    const eventId = String(formData.get("eventId"));
    const userId = String(formData.get("userId"));
    const status = String(formData.get("status")) as "checkedIn" | "absent" | "excused";
    const note = formData.get("note") ? String(formData.get("note")) : undefined;
    await apiFetch(`/events/${eventId}/attendance`, {
        method: "POST",
        body: JSON.stringify({ userId, status, note }),
    });
    revalidatePath("/events");
}

export async function recordContributionAction(formData: FormData) {
    const memberId = String(formData.get("memberId"));
    const amount = Number(formData.get("amount"));
    const date = String(formData.get("date"));
    const fundId = formData.get("fundId") ? String(formData.get("fundId")) : undefined;
    const method = (formData.get("method") as "cash" | "bank-transfer" | "eftpos" | "other") || "cash";
    const note = formData.get("note") ? String(formData.get("note")) : undefined;
    await apiFetch("/giving/contributions", {
        method: "POST",
        body: JSON.stringify({ memberId, amount, date, fundId, method, note }),
    });
    revalidatePath("/giving");
    revalidatePath("/dashboard");
}

export async function updateContributionAction(formData: FormData) {
    const contributionId = String(formData.get("contributionId"));
    const payload: Record<string, unknown> = {};
    const memberId = formData.get("memberId");
    if (memberId) {
        const value = String(memberId);
        if (value.length > 0) {
            payload.memberId = value;
        }
    }
    const amountRaw = formData.get("amount");
    if (amountRaw) {
        const amount = Number(amountRaw);
        if (!Number.isNaN(amount)) {
            payload.amount = amount;
        }
    }
    const dateRaw = formData.get("date");
    if (dateRaw) {
        const iso = toIsoString(String(dateRaw));
        if (iso) {
            payload.date = iso;
        }
    }
    const fundId = formData.get("fundId");
    if (fundId !== null) {
        const value = String(fundId);
        payload.fundId = value;
    }
    const method = formData.get("method");
    if (method) {
        payload.method = String(method);
    }
    const note = formData.get("note");
    if (note !== null) {
        payload.note = String(note);
    }

    await apiFetch(`/giving/contributions/${contributionId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    revalidatePath("/giving");
    revalidatePath("/dashboard");
}

export async function createMemberAction(formData: FormData) {
    const firstName = String(formData.get("firstName") ?? "");
    const lastName = String(formData.get("lastName") ?? "");
    const primaryEmail = String(formData.get("primaryEmail") ?? "");
    const phone = formData.get("phone") ? String(formData.get("phone")) : undefined;
    const address = formData.get("address") ? String(formData.get("address")) : undefined;
    const notes = formData.get("notes") ? String(formData.get("notes")) : undefined;
    const status = formData.get("status") ? String(formData.get("status")) : undefined;
    const roleId = formData.get("roleId") ? String(formData.get("roleId")) : undefined;
    const payload: Record<string, unknown> = {
        firstName,
        lastName,
        primaryEmail,
        phone,
        address,
        notes,
        status,
    };
    if (roleId) {
        payload.roleIds = [roleId];
    }
    const created = await apiFetch<any>("/users", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    revalidatePath("/members");
    const targetId: string | undefined = created?.id ?? created?.user?.id;
    if (targetId) {
        redirect(`/members/${targetId}`);
    }
    redirect("/members");
}

export async function updateMemberAction(formData: FormData) {
    const userId = String(formData.get("userId"));
    const payload: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
        if (key !== "userId") {
            payload[key] = value;
        }
    }

    await apiFetch(`/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    revalidatePath(`/members/${userId}`);
    revalidatePath("/members");
}

export async function deleteMemberAction(formData: FormData) {
    const userId = String(formData.get("userId"));
    await apiFetch(`/users/${userId}`, { method: "DELETE" });
    revalidatePath("/members");
    redirect("/members");
}

export async function createRoleAction(formData: FormData) {
    const name = String(formData.get("name") ?? "");
    const description = formData.get("description") ? String(formData.get("description")) : undefined;
    const permissions = formData.getAll("permissions").map((value) => String(value));
    await apiFetch("/roles", {
        method: "POST",
        body: JSON.stringify({
            name,
            description,
            permissions,
        }),
    });
    revalidatePath("/roles");
    revalidatePath("/members");
}

export async function updateRoleAction(formData: FormData) {
    const roleId = String(formData.get("roleId"));
    const payload: Record<string, unknown> = {};
    const name = formData.get("name") ? String(formData.get("name")) : undefined;
    if (name !== undefined) {
        payload.name = name;
    }
    if (formData.has("description")) {
        const description = formData.get("description");
        payload.description = description !== null && String(description).length > 0 ? String(description) : "";
    }
    const permissions = formData.getAll("permissions").map((value) => String(value));
    payload.permissions = permissions;
    await apiFetch(`/roles/${roleId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    revalidatePath("/roles");
    revalidatePath("/members");
    revalidatePath("/dashboard");
}

export async function deleteRoleAction(formData: FormData) {
    const roleId = String(formData.get("roleId"));
    const reassignRoleId = formData.get("reassignRoleId") ? String(formData.get("reassignRoleId")) : undefined;
    await apiFetch(`/roles/${roleId}`, {
        method: "DELETE",
        body: JSON.stringify({
            reassignRoleId: reassignRoleId && reassignRoleId.length > 0 ? reassignRoleId : undefined,
        }),
    });
    revalidatePath("/roles");
    revalidatePath("/members");
    revalidatePath("/dashboard");
}

export async function addGroupMemberAction(formData: FormData) {
    const groupId = String(formData.get("groupId"));
    const userId = String(formData.get("userId"));
    const role = formData.get("role") ? String(formData.get("role")) : undefined;
    const status = formData.get("status") ? String(formData.get("status")) : undefined;
    await apiFetch(`/groups/${groupId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId, role, status }),
    });
    revalidatePath(`/groups/${groupId}`);
}

export async function updateGroupMemberAction(formData: FormData) {
    const groupId = String(formData.get("groupId"));
    const userId = String(formData.get("userId"));
    const role = formData.get("role") ? String(formData.get("role")) : undefined;
    const status = formData.get("status") ? String(formData.get("status")) : undefined;
    await apiFetch(`/groups/${groupId}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role, status }),
    });
    revalidatePath(`/groups/${groupId}`);
}

export async function removeGroupMemberAction(formData: FormData) {
    const groupId = String(formData.get("groupId"));
    const userId = String(formData.get("userId"));
    await apiFetch(`/groups/${groupId}/members/${userId}`, { method: "DELETE" });
    revalidatePath(`/groups/${groupId}`);
}

const parseTags = (value: FormDataEntryValue | null) => {
    if (!value) return undefined;
    return String(value)
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
};

export async function createEventAction(formData: FormData) {
    const payload = {
        title: String(formData.get("title") ?? ""),
        description: formData.get("description") ? String(formData.get("description")) : undefined,
        startAt: toIsoString(String(formData.get("startAt") ?? "")),
        endAt: toIsoString(formData.get("endAt") ? String(formData.get("endAt")) : undefined),
        location: formData.get("location") ? String(formData.get("location")) : undefined,
        visibility: formData.get("visibility") ? String(formData.get("visibility")) : undefined,
        groupId: formData.get("groupId") ? String(formData.get("groupId")) : undefined,
        tags: parseTags(formData.get("tags")),
    };
    await apiFetch("/events", {
        method: "POST",
        body: JSON.stringify(payload),
    });
    revalidatePath("/events");
}

export async function updateEventAction(formData: FormData) {
    const eventId = String(formData.get("eventId"));
    const rawGroupId = formData.get("groupId");
    const payload = {
        title: formData.get("title") ? String(formData.get("title")) : undefined,
        description: formData.get("description") ? String(formData.get("description")) : undefined,
        startAt: toIsoString(formData.get("startAt") ? String(formData.get("startAt")) : undefined),
        endAt: toIsoString(formData.get("endAt") ? String(formData.get("endAt")) : undefined),
        location: formData.get("location") ? String(formData.get("location")) : undefined,
        visibility: formData.get("visibility") ? String(formData.get("visibility")) : undefined,
        groupId: rawGroupId === "" ? null : rawGroupId ? String(rawGroupId) : undefined,
        tags: parseTags(formData.get("tags")),
    };
    await apiFetch(`/events/${eventId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    revalidatePath("/events");
}

export async function deleteEventAction(formData: FormData) {
    const eventId = String(formData.get("eventId"));
    await apiFetch(`/events/${eventId}`, { method: "DELETE" });
    revalidatePath("/events");
}

export async function demoLoginAction(formData: FormData) {
    const cookieStore = cookies();
    const returnTo = formData.get("returnTo")?.toString();
    cookieStore.set("demo_token", "demo-admin", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    cookieStore.set("session_provider", "demo", {
        path: "/",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    redirect(returnTo || "/dashboard");
}

export async function addChildAction(formData: FormData) {
    const householdId = String(formData.get("householdId"));
    const fullName = String(formData.get("fullName"));
    const dateOfBirth = String(formData.get("dateOfBirth"));
    const allergies = formData.get("allergies") ? String(formData.get("allergies")) : undefined;
    const medicalNotes = formData.get("medicalNotes") ? String(formData.get("medicalNotes")) : undefined;

    await postToApi("/checkin/children", {
        householdId,
        fullName,
        dateOfBirth,
        allergies,
        medicalNotes,
    });

    revalidatePath(`/members/${String(formData.get("userId"))}`);
}

export async function updatePrayerRequestAction(formData: FormData) {
    const prayerRequestId = String(formData.get("prayerRequestId"));
    await apiFetch(`/prayer-requests/${prayerRequestId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Answered" }),
    });
    revalidatePath("/prayer");
}
