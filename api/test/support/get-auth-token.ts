import { INestApplication } from '@nestjs/common';
import { AuthService } from '../../src/modules/auth/auth.service';

export const getAuthToken = async (app: INestApplication): Promise<string> => {
  const authService = app.get(AuthService);
  const { session } = await authService.login('admin@example.com', 'demo');
  return session.token;
};
