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

  async createUser(input: Parameters<MockDatabaseService['createUser']>[0]) {
    return this.mock.createUser(input);
  }

  async updateUser(id: string, input: Parameters<MockDatabaseService['updateUser']>[1]) {
    return this.mock.updateUser(id, input);
  }

  async deleteUser(id: string, input: Parameters<MockDatabaseService['deleteUser']>[1]) {
    return this.mock.deleteUser(id, input);
  }

  async listHouseholds(churchId?: string) {
    return this.mock.listHouseholds(churchId);
  }

  async getHouseholdById(id: string) {
    return this.mock.getHouseholdById(id);
  }

  async getHouseholdMembers(householdId: string) {
    return this.mock.getHouseholdMembers(householdId);
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

  async addGroupMember(groupId: string, input: Parameters<MockDatabaseService['addGroupMember']>[1]) {
    return this.mock.addGroupMember(groupId, input);
  }

  async updateGroupMember(
    groupId: string,
    userId: string,
    input: Parameters<MockDatabaseService['updateGroupMember']>[2],
  ) {
    return this.mock.updateGroupMember(groupId, userId, input);
  }

  async removeGroupMember(
    groupId: string,
    userId: string,
    input: Parameters<MockDatabaseService['removeGroupMember']>[2],
  ) {
    return this.mock.removeGroupMember(groupId, userId, input);
  }

  async listEvents() {
    return this.mock.listEvents();
  }

  async getEventById(id: string) {
    return this.mock.getEventById(id);
  }

  async createEvent(input: Parameters<MockDatabaseService['createEvent']>[0]) {
    return this.mock.createEvent(input);
  }

  async updateEvent(id: string, input: Parameters<MockDatabaseService['updateEvent']>[1]) {
    return this.mock.updateEvent(id, input);
  }

  async deleteEvent(id: string, input: Parameters<MockDatabaseService['deleteEvent']>[1]) {
    return this.mock.deleteEvent(id, input);
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

  async createAnnouncement(input: Parameters<MockDatabaseService['createAnnouncement']>[0]) {
    return this.mock.createAnnouncement(input);
  }

  async updateAnnouncement(id: string, input: Parameters<MockDatabaseService['updateAnnouncement']>[1]) {
    return this.mock.updateAnnouncement(id, input);
  }
  async listRoles() {
    return this.mock.listRoles();
  }

  async createRole(input: Parameters<MockDatabaseService['createRole']>[0]) {
    return this.mock.createRole(input);
  }

  async updateRole(id: string, input: Parameters<MockDatabaseService['updateRole']>[1]) {
    return this.mock.updateRole(id, input);
  }

  async deleteRole(id: string, input: Parameters<MockDatabaseService['deleteRole']>[1]) {
    return this.mock.deleteRole(id, input);
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

  async updateContribution(id: string, input: Parameters<MockDatabaseService['updateContribution']>[1]) {
    return this.mock.updateContribution(id, input);
  }

  async getGivingSummary(churchId: string) {
    return this.mock.getGivingSummary(churchId);
  }

  async exportContributionsCsv(input?: Parameters<MockDatabaseService['exportContributionsCsv']>[0]) {
    return this.mock.exportContributionsCsv(input);
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

  async upsertUserFromOAuth(input: Parameters<MockDatabaseService['upsertUserFromOAuth']>[0]) {
    return this.mock.upsertUserFromOAuth(input);
  }

  async getSettings(churchId: string) {
    return this.mock.getSettings(churchId);
  }

  async updateSettings(churchId: string, settings: any) {
    return this.mock.updateSettings(churchId, settings);
  }

  async createChild(data: Parameters<MockDatabaseService['createChild']>[0]) {
    return this.mock.createChild(data);
  }

  async updateChild(id: string, data: Parameters<MockDatabaseService['updateChild']>[1]) {
    return this.mock.updateChild(id, data);
  }

  async deleteChild(id: string, input: Parameters<MockDatabaseService['deleteChild']>[1]) {
    return this.mock.deleteChild(id, input);
  }

  async createPushSubscription(data: any) {
    return this.mock.createPushSubscription(data);
  }

  async getPushSubscriptionsByUserId(userId: string) {
    return this.mock.getPushSubscriptionsByUserId(userId);
  }

  async getChildren(householdId: string) {
    return this.mock.getChildren(householdId);
  }

  async getCheckinsByEventId(eventId: string) {
    return this.mock.getCheckinsByEventId(eventId);
  }

  async createCheckin(data: Parameters<MockDatabaseService['createCheckin']>[0]) {
    return this.mock.createCheckin(data);
  }

  async updateCheckin(id: string, data: Parameters<MockDatabaseService['updateCheckin']>[1]) {
    return this.mock.updateCheckin(id, data);
  }

  async getCheckinById(id: string) {
    return this.mock.getCheckinById(id);
  }

  async createPastoralCareTicket(input: Parameters<MockDatabaseService['createPastoralCareTicket']>[0]) {
    return this.mock.createPastoralCareTicket(input);
  }

  async updatePastoralCareTicket(id: string, input: Parameters<MockDatabaseService['updatePastoralCareTicket']>[1]) {
    return this.mock.updatePastoralCareTicket(id, input);
  }

  async createPastoralCareComment(input: Parameters<MockDatabaseService['createPastoralCareComment']>[0]) {
    return this.mock.createPastoralCareComment(input);
  }

  async getPastoralCareTicket(id: string) {
    return this.mock.getPastoralCareTicket(id);
  }

  async listPastoralCareTickets(churchId: string) {
    return this.mock.listPastoralCareTickets(churchId);
  }
}
