import { NextRequest, NextResponse } from "next/server";
import { auth0AuthClient } from "@/lib/auth0.server";

type AuthRouteParams = { auth0?: string[] };

const routeHandlers: Record<
    string,
    (request: NextRequest) => Promise<Response>
> = {
    login: (request) => auth0AuthClient.handleLogin(request),
    logout: (request) => auth0AuthClient.handleLogout(request),
    callback: (request) => auth0AuthClient.handleCallback(request),
    "backchannel-logout": (request) =>
        auth0AuthClient.handleBackChannelLogout(request),
    connect: (request) => auth0AuthClient.handleConnectAccount(request),
    "access-token": (request) => auth0AuthClient.handleAccessToken(request),
    me: (request) => auth0AuthClient.handleProfile(request),
};

const DEFAULT_HANDLER = "login";

async function handleRequest(
    request: NextRequest,
    { params }: { params: AuthRouteParams }
): Promise<Response> {
    const [action] = params.auth0 ?? [];
    const handler = routeHandlers[action ?? DEFAULT_HANDLER];

    if (!handler) {
        return NextResponse.json(
            { error: "Unsupported auth route" },
            { status: 404 }
        );
    }

    return handler(request);
}

export const GET = handleRequest;
export const POST = handleRequest;
