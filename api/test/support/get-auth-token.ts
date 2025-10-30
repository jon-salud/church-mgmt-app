import { INestApplication } from '@nestjs/common';
import { AuthService } from '../../src/modules/auth/auth.service';

export const getAuthToken = async (app: INestApplication): Promise<string> => {
  // For deterministic e2e-light tests use the seeded demo session token.
  // This avoids cross-instance MockDatabaseService session visibility issues
  // during test-time provider wiring.
  return 'demo-admin';
};
