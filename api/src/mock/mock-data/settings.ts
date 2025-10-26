export interface MockSettings {
  id: string;
  churchId: string;
  logoUrl?: string;
  brandColor?: string;
  onboardingComplete?: boolean;
  enabledFields: string[];
  requestTypes: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
