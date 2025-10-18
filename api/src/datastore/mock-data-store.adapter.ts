import { Injectable } from '@nestjs/common';
import { MockDatabaseService } from '../mock/mock-database.service';
import { DataStore } from './data-store.types';

@Injectable()
export class MockDataStoreAdapter implements DataStore {
  constructor(private readonly mock: MockDatabaseService) {}

  async getChurch() {
    return this.mock.getChurch();
  }

  async getDashboardSnapshot(churchId: string) {
    return this.mock.getDashboardSnapshot(churchId);
  }

  async listUsers(q?: string) {
    return this.mock.listUsers(q);
  }

  async getUserProfile(id: string) {
    return this.mock.getUserProfile(id);
  }

  async getUserById(id: string) {
    return this.mock.getUserById(id);
  }

  async getUserByEmail(email: string) {
    return this.mock.getUserByEmail(email);
  }

  async listGroups(churchId?: string) {
    return this.mock.listGroups(churchId);
  }

  async getGroupById(id: string) {
    return this.mock.getGroupById(id);
  }

  async getGroupMembers(groupId: string) {
    return this.mock.getGroupMembers(groupId);
  }

  async listEvents() {
    return this.mock.listEvents();
  }

  async getEventById(id: string) {
    return this.mock.getEventById(id);
  }

  async recordAttendance(input: Parameters<MockDatabaseService['recordAttendance']>[0]) {
    return this.mock.recordAttendance(input);
  }

  async listAnnouncements(churchId?: string) {
    return this.mock.listAnnouncements(churchId);
  }

  async markAnnouncementRead(announcementId: string, userId: string) {
    return this.mock.markAnnouncementRead(announcementId, userId);
  }

  async listFunds() {
    return this.mock.listFunds();
  }

  async listContributions(filter?: { memberId?: string; fundId?: string }) {
    return this.mock.listContributions(filter);
  }

  async recordContribution(input: Parameters<MockDatabaseService['recordContribution']>[0]) {
    return this.mock.recordContribution(input);
  }

  async createSession(email: string, provider: any, requestedRole?: any) {
    return this.mock.createSession(email, provider, requestedRole);
  }

  async getSessionByToken(token?: string) {
    return this.mock.getSessionByToken(token);
  }

  async listAuditLogs(filter?: any) {
    return this.mock.listAuditLogs(filter);
  }

  async createAuditLog(input: Parameters<MockDatabaseService['createAuditLog']>[0]) {
    return this.mock.createAuditLog(input);
  }
}
