"use server";

import { cookies } from "next/headers";

const API_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:3001/api/v1";

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token =
    cookieStore.get("session_token")?.value ||
    cookieStore.get("demo_token")?.value ||
    (process.env.NODE_ENV !== "production" ? "demo-admin" : "");

  if (!token) {
    return new Response("Missing credentials", { status: 401 });
  }

  const url = new URL(request.url);
  const query = url.search ? url.search : "";
  const upstream = await fetch(`${API_BASE}/giving/contributions.csv${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const payload = await upstream.text();
  if (!upstream.ok) {
    return new Response(payload, { status: upstream.status });
  }

  const disposition =
    upstream.headers.get("content-disposition") ||
    "attachment; filename=contributions.csv";

  return new Response(payload, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": disposition,
    },
  });
}
