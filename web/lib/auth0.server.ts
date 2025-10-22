
import { initAuth0 } from '@auth0/nextjs-auth0';

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

export const auth0 = initAuth0({
    baseURL: process.env.AUTH0_BASE_URL ?? process.env.APP_BASE_URL,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    secret: process.env.AUTH0_SECRET,
});

export const auth0AuthClient = auth0;
