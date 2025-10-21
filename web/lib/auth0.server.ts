import { Auth0Client, AuthClient } from "@auth0/nextjs-auth0/server";

function getDomain(): string | undefined {
    const issuer = process.env.AUTH0_ISSUER_BASE_URL;
    if (issuer) {
        try {
            return new URL(issuer).hostname;
        } catch {
            // fall through for misconfigured issuer URL; Auth0Client will surface an explicit error
        }
    }
    return process.env.AUTH0_DOMAIN;
}

export const auth0 = new Auth0Client({
    domain: getDomain(),
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    secret: process.env.AUTH0_SECRET,
    appBaseUrl: process.env.AUTH0_BASE_URL ?? process.env.APP_BASE_URL,
    routes: {
        login: "/api/auth/login",
        logout: "/api/auth/logout",
        callback: "/api/auth/callback",
        backChannelLogout: "/api/auth/backchannel-logout",
        connectAccount: "/api/auth/connect",
    },
});

export const auth0AuthClient = (auth0 as unknown as { authClient: AuthClient })
    .authClient;
