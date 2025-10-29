/**
 * Test database utilities for integration testing
 */

// Mock interfaces for testing
interface MockUser {
  id: string;
  primaryEmail: string;
  churchId: string;
  status: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  roles?: Array<{ churchId: string; roleId: string }>;
}

interface MockGroup {
  id: string;
  name: string;
  churchId: string;
}

interface MockDocument {
  id: string;
  name: string;
  churchId: string;
}

/**
 * Simple in-memory database for testing
 */
export class MockInMemoryDataStore {
  private users: Map<string, MockUser> = new Map();
  private groups: Map<string, MockGroup> = new Map();
  private documents: Map<string, MockDocument> = new Map();

  // User operations
  async createUser(user: MockUser): Promise<MockUser> {
    this.users.set(user.id, user);
    return user;
  }

  async getUserById(id: string): Promise<MockUser | null> {
    return this.users.get(id) || null;
  }

  async listUsers(): Promise<MockUser[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, updates: Partial<MockUser>): Promise<MockUser | null> {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<{ success: boolean }> {
    const exists = this.users.has(id);
    if (exists) {
      this.users.delete(id);
    }
    return { success: exists };
  }

  // Group operations
  async createGroup(group: MockGroup): Promise<MockGroup> {
    this.groups.set(group.id, group);
    return group;
  }

  async getGroupById(id: string): Promise<MockGroup | null> {
    return this.groups.get(id) || null;
  }

  async listGroups(): Promise<MockGroup[]> {
    return Array.from(this.groups.values());
  }

  // Document operations
  async createDocument(document: MockDocument): Promise<MockDocument> {
    this.documents.set(document.id, document);
    return document;
  }

  async getDocumentById(id: string): Promise<MockDocument | null> {
    return this.documents.get(id) || null;
  }

  async listDocuments(): Promise<MockDocument[]> {
    return Array.from(this.documents.values());
  }

  async updateDocument(id: string, updates: Partial<MockDocument>): Promise<MockDocument | null> {
    const document = this.documents.get(id);
    if (!document) return null;
    const updated = { ...document, ...updates };
    this.documents.set(id, updated);
    return updated;
  }

  async deleteDocument(id: string): Promise<{ success: boolean }> {
    const exists = this.documents.has(id);
    if (exists) {
      this.documents.delete(id);
    }
    return { success: exists };
  }
}

/**
 * Test database utilities for integration testing
 */
export class TestDatabase {
  private static instance: MockInMemoryDataStore;

  /**
   * Get or create a shared in-memory database instance for tests
   */
  static getInstance(): MockInMemoryDataStore {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new MockInMemoryDataStore();
    }
    return TestDatabase.instance;
  }

  /**
   * Create a fresh database instance for isolated tests
   */
  static createFresh(): MockInMemoryDataStore {
    return new MockInMemoryDataStore();
  }

  /**
   * Reset the shared database instance
   */
  static reset(): void {
    TestDatabase.instance = new MockInMemoryDataStore();
  }

  /**
   * Seed the database with test data
   */
  static async seedWithData(data: {
    users?: MockUser[];
    groups?: MockGroup[];
    documents?: MockDocument[];
  }): Promise<MockInMemoryDataStore> {
    const db = TestDatabase.createFresh();

    // Seed users
    if (data.users) {
      for (const user of data.users) {
        await db.createUser(user);
      }
    }

    // Seed groups
    if (data.groups) {
      for (const group of data.groups) {
        await db.createGroup(group);
      }
    }

    // Seed documents
    if (data.documents) {
      for (const document of data.documents) {
        await db.createDocument(document);
      }
    }

    return db;
  }
}

/**
 * Database setup utilities for tests
 */
export class DatabaseSetup {
  /**
   * Setup database with basic test data
   */
  static async withBasicData() {
    const users = [
      {
        id: 'user-admin-001',
        primaryEmail: 'admin@test.com',
        churchId: 'church-test-001',
        status: 'active',
        profile: { firstName: 'Admin', lastName: 'User' },
      },
      {
        id: 'user-leader-001',
        primaryEmail: 'leader@test.com',
        churchId: 'church-test-001',
        status: 'active',
        profile: { firstName: 'Leader', lastName: 'User' },
      },
      {
        id: 'user-member-001',
        primaryEmail: 'member@test.com',
        churchId: 'church-test-001',
        status: 'active',
        profile: { firstName: 'Member', lastName: 'User' },
      },
    ];

    const groups = [
      {
        id: 'group-small-001',
        name: 'Small Group Alpha',
        churchId: 'church-test-001',
      },
      {
        id: 'group-ministry-001',
        name: 'Worship Ministry',
        churchId: 'church-test-001',
      },
    ];

    const documents = [
      {
        id: 'doc-pdf-001',
        name: 'Test Document.pdf',
        churchId: 'church-test-001',
      },
      {
        id: 'doc-image-001',
        name: 'Test Image.jpg',
        churchId: 'church-test-001',
      },
    ];

    return TestDatabase.seedWithData({ users, groups, documents });
  }

  /**
   * Setup database with empty state
   */
  static async empty() {
    return TestDatabase.createFresh();
  }

  /**
   * Setup database with specific entities
   */
  static async withEntities(entities: {
    users?: MockUser[];
    groups?: MockGroup[];
    documents?: MockDocument[];
  }) {
    return TestDatabase.seedWithData(entities);
  }
}
