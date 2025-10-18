import { MockDatabaseService } from '../mock/mock-database.service';

type Method<T extends keyof MockDatabaseService> = MockDatabaseService[T];

export interface DataStore {
  getChurch: Method<'getChurch'>;
  getDashboardSnapshot: Method<'getDashboardSnapshot'>;
  listUsers: Method<'listUsers'>;
  getUserProfile: Method<'getUserProfile'>;
  listGroups: Method<'listGroups'>;
  getGroupById: Method<'getGroupById'>;
  getGroupMembers: Method<'getGroupMembers'>;
  listEvents: Method<'listEvents'>;
  getEventById: Method<'getEventById'>;
  recordAttendance: Method<'recordAttendance'>;
  listAnnouncements: Method<'listAnnouncements'>;
  markAnnouncementRead: Method<'markAnnouncementRead'>;
  listFunds: Method<'listFunds'>;
  listContributions: Method<'listContributions'>;
  recordContribution: Method<'recordContribution'>;
  createSession: Method<'createSession'>;
  getSessionByToken: Method<'getSessionByToken'>;
  listAuditLogs: Method<'listAuditLogs'>;
  createAuditLog: Method<'createAuditLog'>;
}

export const DATA_STORE = Symbol('DATA_STORE');
