/**
 * Authentication test utilities for integration tests
 */
export class AuthTestUtils {
  /**
   * Creates mock request headers for authentication
   */
  static mockAuthHeaders(userId: string = 'demo-admin', token: string = 'demo_token') {
    return {
      headers: {
        authorization: `Bearer ${token}`,
        cookie: `demo_token=${token}`,
      },
      cookies: {
        demo_token: token,
      },
      user: {
        id: userId,
        email: 'admin@church.com',
        roles: ['admin'],
      },
    };
  }

  /**
   * Creates authentication headers for HTTP requests
   */
  static getAuthHeaders(token: string = 'demo_token') {
    return {
      Authorization: `Bearer ${token}`,
      Cookie: `demo_token=${token}`,
    };
  }

  /**
   * Creates demo authentication for different user roles
   */
  static getDemoAuth(role: 'admin' | 'leader' | 'member' = 'admin') {
    const tokens = {
      admin: 'demo-admin',
      leader: 'demo-leader',
      member: 'demo-member',
    };

    const userIds = {
      admin: 'user-admin-001',
      leader: 'user-leader-001',
      member: 'user-member-001',
    };

    return {
      token: tokens[role],
      userId: userIds[role],
      headers: this.getAuthHeaders(tokens[role]),
      request: this.mockAuthHeaders(userIds[role], tokens[role]),
    };
  }

  /**
   * Creates unauthenticated headers for testing auth guards
   */
  static mockUnauthenticatedHeaders() {
    return {
      headers: {},
      cookies: {},
    };
  }
}

/**
 * JWT token utilities for testing
 */
export class JwtTestUtils {
  /**
   * Creates a mock JWT payload
   */
  static createMockPayload(userId: string, email: string, roles: string[] = []) {
    return {
      sub: userId,
      email,
      roles,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };
  }

  /**
   * Creates a mock JWT token string (not cryptographically valid, just for testing)
   */
  static createMockToken(userId: string, email: string, roles: string[] = []): string {
    const payload = this.createMockPayload(userId, email, roles);
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${encodedHeader}.${encodedPayload}.mock-signature`;
  }
}
