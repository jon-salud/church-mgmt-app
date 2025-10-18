import { DataStore } from '../../src/datastore';

const resolvedFn = <T>(value?: T) => jest.fn().mockResolvedValue(value);

export const createDataStoreMock = (): jest.Mocked<DataStore> => ({
  getChurch: resolvedFn(),
  getDashboardSnapshot: resolvedFn(),
  listUsers: resolvedFn(),
  getUserById: resolvedFn(),
  getUserByEmail: resolvedFn(),
  getUserProfile: resolvedFn(),
  listGroups: resolvedFn(),
  getGroupById: resolvedFn(),
  getGroupMembers: resolvedFn(),
  listEvents: resolvedFn(),
  getEventById: resolvedFn(),
  recordAttendance: resolvedFn(),
  listAnnouncements: resolvedFn(),
  markAnnouncementRead: resolvedFn(),
  listFunds: resolvedFn(),
  listContributions: resolvedFn(),
  recordContribution: resolvedFn(),
  createSession: resolvedFn(),
  getSessionByToken: resolvedFn(),
  listAuditLogs: resolvedFn(),
  createAuditLog: resolvedFn(),
});
