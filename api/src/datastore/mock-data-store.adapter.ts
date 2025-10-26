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

  async getSettings(churchId: string) {
    return this.mock.getSettings(churchId);
  }

  async initializeSettings(churchId: string) {
    return this.mock.initializeSettings(churchId);
  }

  async updateSettings(churchId: string, update: any) {
    return this.mock.updateSettings(churchId, update);
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

  async addGroupMember(
    groupId: string,
    input: Parameters<MockDatabaseService['addGroupMember']>[1]
  ) {
    return this.mock.addGroupMember(groupId, input);
  }

  async updateGroupMember(
    groupId: string,
    userId: string,
    input: Parameters<MockDatabaseService['updateGroupMember']>[2]
  ) {
    return this.mock.updateGroupMember(groupId, userId, input);
  }

  async removeGroupMember(
    groupId: string,
    userId: string,
    input: Parameters<MockDatabaseService['removeGroupMember']>[2]
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

  async createEventVolunteerRole(
    input: Parameters<MockDatabaseService['createEventVolunteerRole']>[0]
  ) {
    return this.mock.createEventVolunteerRole(input);
  }

  async updateEventVolunteerRole(
    id: string,
    input: Parameters<MockDatabaseService['updateEventVolunteerRole']>[1]
  ) {
    return this.mock.updateEventVolunteerRole(id, input);
  }

  async deleteEventVolunteerRole(id: string) {
    return this.mock.deleteEventVolunteerRole(id);
  }

  async createEventVolunteerSignup(
    input: Parameters<MockDatabaseService['createEventVolunteerSignup']>[0]
  ) {
    return this.mock.createEventVolunteerSignup(input);
  }

  async deleteEventVolunteerSignup(id: string) {
    return this.mock.deleteEventVolunteerSignup(id);
  }

  async getEventVolunteerSignupById(id: string) {
    return this.mock.getEventVolunteerSignupById(id);
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

  async updateAnnouncement(
    id: string,
    input: Parameters<MockDatabaseService['updateAnnouncement']>[1]
  ) {
    return this.mock.updateAnnouncement(id, input);
  }
  async listRoles() {
    return this.mock.listRoles();
  }

  async getRole(id: string) {
    return this.mock.getRole(id);
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

  async updateContribution(
    id: string,
    input: Parameters<MockDatabaseService['updateContribution']>[1]
  ) {
    return this.mock.updateContribution(id, input);
  }

  async getGivingSummary(churchId: string) {
    return this.mock.getGivingSummary(churchId);
  }

  async exportContributionsCsv(
    input?: Parameters<MockDatabaseService['exportContributionsCsv']>[0]
  ) {
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

  async createPastoralCareTicket(
    input: Parameters<MockDatabaseService['createPastoralCareTicket']>[0]
  ) {
    return this.mock.createPastoralCareTicket(input);
  }

  async updatePastoralCareTicket(
    id: string,
    input: Parameters<MockDatabaseService['updatePastoralCareTicket']>[1]
  ) {
    return this.mock.updatePastoralCareTicket(id, input);
  }

  async createPastoralCareComment(
    input: Parameters<MockDatabaseService['createPastoralCareComment']>[0]
  ) {
    return this.mock.createPastoralCareComment(input);
  }

  async getPastoralCareTicket(id: string) {
    return this.mock.getPastoralCareTicket(id);
  }

  async listPastoralCareTickets(churchId: string) {
    return this.mock.listPastoralCareTickets(churchId);
  }

  async getPrayerRequests() {
    return this.mock.getPrayerRequests();
  }

  async getRequests() {
    return this.mock.getRequests();
  }

  async createRequest(
    input: Parameters<MockDatabaseService['createRequest']>[0],
    actorUserId: string
  ) {
    return this.mock.createRequest(input, actorUserId);
  }

  async listRequestTypes(churchId: string) {
    return this.mock.listRequestTypes(churchId);
  }

  async createRequestType(
    name: string,
    hasConfidentialField: boolean,
    actorUserId: string,
    description?: string
  ) {
    return this.mock.createRequestType(name, hasConfidentialField, actorUserId, description);
  }

  async updateRequestType(id: string, name: string, actorUserId: string) {
    return this.mock.updateRequestType(id, name, actorUserId);
  }

  async archiveRequestType(id: string, actorUserId: string) {
    return this.mock.archiveRequestType(id, actorUserId);
  }

  async updateRequestTypeStatus(id: string, status: 'active' | 'archived', actorUserId: string) {
    return this.mock.updateRequestTypeStatus(id, status, actorUserId);
  }

  async reorderRequestTypes(ids: string[], actorUserId: string) {
    return this.mock.reorderRequestTypes(ids, actorUserId);
  }

  async createInvitation(
    churchId: string,
    email: string,
    roleId: string | undefined,
    actorUserId: string,
    type?: 'team' | 'member'
  ) {
    return this.mock.createInvitation(churchId, email, roleId, actorUserId, type);
  }

  async getInvitationByToken(token: string) {
    return this.mock.getInvitationByToken(token);
  }

  async acceptInvitation(token: string, userId: string) {
    return this.mock.acceptInvitation(token, userId);
  }

  async listInvitations(churchId: string) {
    return this.mock.listInvitations(churchId);
  }

  async bulkCreateInvitations(
    churchId: string,
    emails: string[],
    roleId: string | undefined,
    actorUserId: string,
    type?: 'team' | 'member'
  ) {
    return this.mock.bulkCreateInvitations(churchId, emails, roleId, actorUserId, type);
  }

  // Document Library methods
  async listDocuments(churchId: string, userRoleIds: string[]) {
    return this.mock.listDocuments(churchId, userRoleIds);
  }

  async getDocument(id: string) {
    return this.mock.getDocument(id);
  }

  async getDocumentWithPermissions(id: string, userRoleIds: string[]) {
    return this.mock.getDocumentWithPermissions(id, userRoleIds);
  }

  async createDocument(
    churchId: string,
    uploaderProfileId: string,
    fileName: string,
    fileType: string,
    title: string,
    description: string | undefined,
    fileData: string,
    roleIds: string[],
    actorUserId: string
  ) {
    return this.mock.createDocument(
      churchId,
      uploaderProfileId,
      fileName,
      fileType,
      title,
      description,
      fileData,
      roleIds,
      actorUserId
    );
  }

  async updateDocument(
    id: string,
    title: string | undefined,
    description: string | undefined,
    roleIds: string[] | undefined,
    actorUserId: string
  ) {
    return this.mock.updateDocument(id, title, description, roleIds, actorUserId);
  }

  async deleteDocument(id: string, actorUserId: string) {
    return this.mock.deleteDocument(id, actorUserId);
  }

  async hardDeleteDocument(id: string, actorUserId: string) {
    return this.mock.hardDeleteDocument(id, actorUserId);
  }

  async undeleteDocument(id: string, actorUserId: string) {
    return this.mock.undeleteDocument(id, actorUserId);
  }

  async listDeletedDocuments(churchId: string) {
    return this.mock.listDeletedDocuments(churchId);
  }

  async getDocumentPermissions(documentId: string) {
    return this.mock.getDocumentPermissions(documentId);
  }

  // Soft delete management methods
  async hardDeleteUser(id: string, input: Parameters<MockDatabaseService['hardDeleteUser']>[1]) {
    return this.mock.hardDeleteUser(id, input);
  }

  async hardDeleteEvent(id: string, input: Parameters<MockDatabaseService['hardDeleteEvent']>[1]) {
    return this.mock.hardDeleteEvent(id, input);
  }

  async hardDeleteRole(id: string, input: Parameters<MockDatabaseService['hardDeleteRole']>[1]) {
    return this.mock.hardDeleteRole(id, input);
  }

  async undeleteUser(id: string, input: Parameters<MockDatabaseService['undeleteUser']>[1]) {
    return this.mock.undeleteUser(id, input);
  }

  async undeleteEvent(id: string, input: Parameters<MockDatabaseService['undeleteEvent']>[1]) {
    return this.mock.undeleteEvent(id, input);
  }

  async undeleteRole(id: string, input: Parameters<MockDatabaseService['undeleteRole']>[1]) {
    return this.mock.undeleteRole(id, input);
  }

  async listDeletedUsers(q?: string) {
    return this.mock.listDeletedUsers(q);
  }

  async listDeletedEvents() {
    return this.mock.listDeletedEvents();
  }

  async listDeletedRoles() {
    return this.mock.listDeletedRoles();
  }
}
