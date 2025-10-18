import { DataStore } from '../../src/datastore';

export const createDataStoreMock = (): jest.Mocked<DataStore> => ({
  getChurch: jest.fn(),
  getDashboardSnapshot: jest.fn(),
  listUsers: jest.fn(),
  getUserProfile: jest.fn(),
  listGroups: jest.fn(),
  getGroupById: jest.fn(),
  getGroupMembers: jest.fn(),
  listEvents: jest.fn(),
  getEventById: jest.fn(),
  recordAttendance: jest.fn(),
  listAnnouncements: jest.fn(),
  markAnnouncementRead: jest.fn(),
  listFunds: jest.fn(),
  listContributions: jest.fn(),
  recordContribution: jest.fn(),
  createSession: jest.fn(),
  getSessionByToken: jest.fn(),
  listAuditLogs: jest.fn(),
  createAuditLog: jest.fn(),
});
