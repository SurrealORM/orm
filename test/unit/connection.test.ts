import { SurrealORM } from '../../src/connection';
import { User, TestUser } from '../test-helpers';
import { RecordId } from 'surrealdb';
import { createTestORM, TEST_CONFIG } from '../setup';

describe('SurrealORM', () => {
  let localOrm: SurrealORM;
  let testORM: SurrealORM;
  
  beforeEach(async () => {
    // Create a separate connection for tests that need specific setup
    localOrm = new SurrealORM(TEST_CONFIG);
    testORM = createTestORM('connection_test');
    
    // Connect as root to ensure proper permissions
    await localOrm.connect('root');
    await testORM.connect('root');
    
    // Switch to test namespace and database
    await localOrm.raw('USE NAMESPACE test');
    await localOrm.raw(`USE DATABASE ${testORM.database}`);
    await testORM.raw('USE NAMESPACE test');
    await testORM.raw(`USE DATABASE ${testORM.database}`);
  });
  
  afterEach(async () => {
    // Disconnect local connection if it was used
    if (localOrm && localOrm !== testORM) {
      await localOrm.disconnect();
    }
    await testORM.disconnect();
  });
  
  describe('Connection', () => {
    it('should connect successfully', async () => {
      const connected = await localOrm.isConnected();
      expect(connected).toBe(true);
    });
    
    it('should disconnect successfully', async () => {
      await localOrm.disconnect();
      const connected = await localOrm.isConnected();
      expect(connected).toBe(false);
    });
  });
  
  describe('CRUD Operations', () => {
    const TEST_TABLE = 'test_users';
    
    beforeEach(async () => {
      // Clean up any existing data
      try {
        await testORM.raw(`DELETE FROM ${TEST_TABLE}`);
      } catch (e) {
        // Ignore if table doesn't exist
      }
    });

    afterEach(async () => {
      // Clean up after each test
      try {
        await testORM.raw(`DELETE FROM ${TEST_TABLE}`);
      } catch (e) {
        // Ignore if table doesn't exist
      }
    });

    describe('create', () => {
      it('should create a new entity', async () => {
        const user = new TestUser();
        user.name = 'John Doe';
        user.email = 'john@example.com';
        user.username = 'johndoe';
        user.age = 30;
        
        const result = await testORM.create(user);
        
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe('John Doe');
        expect(result.email).toBe('john@example.com');
        expect(result.username).toBe('johndoe');
        expect(result.age).toBe(30);
      });
      
      it('should throw if not connected', async () => {
        const disconnectedOrm = new SurrealORM(TEST_CONFIG);
        
        const user = new TestUser();
        user.name = 'John Doe';
        user.age = 30;
        
        await expect(disconnectedOrm.create(user)).rejects.toThrow('No socket is currently connected to a SurrealDB instance. Please call the .connect() method first!');
      });
    });
    
    describe('findUnique', () => {
      it('should find a unique entity by criteria', async () => {
        // Create a user first
        const user = new TestUser();
        user.name = 'John Doe';
        user.email = 'john@example.com';
        user.username = 'johndoe';
        user.age = 30;
        await testORM.create(user);
        
        // Find the user
        const found = await testORM.findUnique(TestUser, { email: 'john@example.com' });
        
        expect(found).toBeDefined();
        expect(found?.email).toBe('john@example.com');
      });
      
      it('should return null when no entity is found', async () => {
        const found = await testORM.findUnique(TestUser, { email: 'nonexistent@example.com' });
        expect(found).toBeNull();
      });
      
      it('should throw if field is not marked as unique', async () => {
        await expect(testORM.findUnique(TestUser, { name: 'John Doe' })).rejects.toThrow(
          'Field name is not marked as unique'
        );
      });
    });
    
    describe('findMany', () => {
      it('should find multiple entities by criteria', async () => {
        // Create test users
        const user1 = new TestUser();
        user1.name = 'John';
        user1.email = 'john@example.com';
        user1.username = 'john';
        user1.age = 30;
        await testORM.create(user1);
        
        const user2 = new TestUser();
        user2.name = 'Jane';
        user2.email = 'jane@example.com';
        user2.username = 'jane';
        user2.age = 30;
        await testORM.create(user2);
        
        const user3 = new TestUser();
        user3.name = 'Bob';
        user3.email = 'bob@example.com';
        user3.username = 'bob';
        user3.age = 25;
        await testORM.create(user3);
        
        // Find users with age 30
        const found = await testORM.findMany(TestUser, { age: 30 });
        
        expect(found).toHaveLength(2);
        expect(found.map((u: TestUser) => u.name).sort()).toEqual(['Jane', 'John']);
      });
      
      it('should return empty array when no entities are found', async () => {
        const found = await testORM.findMany(TestUser, { age: 100 });
        expect(found).toHaveLength(0);
      });
    });
    
    describe('findAll', () => {
      it('should find all entities of a type', async () => {
        // Create test users
        const user1 = new TestUser();
        user1.name = 'John';
        user1.email = 'john@example.com';
        user1.username = 'john';
        user1.age = 30;
        await testORM.create(user1);
        
        const user2 = new TestUser();
        user2.name = 'Jane';
        user2.email = 'jane@example.com';
        user2.username = 'jane';
        user2.age = 31;
        await testORM.create(user2);
        
        const user3 = new TestUser();
        user3.name = 'Bob';
        user3.email = 'bob@example.com';
        user3.username = 'bob';
        user3.age = 32;
        await testORM.create(user3);
        
        // Find all users
        const found = await testORM.findAll(TestUser);
        
        expect(found).toHaveLength(3);
        expect(found.map((u: TestUser) => u.name).sort()).toEqual(['Bob', 'Jane', 'John']);
      });
      
      it('should return empty array when no entities exist', async () => {
        const found = await testORM.findAll(TestUser);
        expect(found).toHaveLength(0);
      });
    });
    
    describe('update', () => {
      it('should update an existing entity', async () => {
        // Create a user first
        const user = new TestUser();
        user.name = 'John Doe';
        user.email = 'john@example.com';
        user.username = 'johndoe';
        user.age = 30;
        const created = await testORM.create(user);
        
        // Update the user
        created.name = 'John Updated';
        created.age = 31;
        const updated = await testORM.update(created);
        
        expect(updated).toBeDefined();
        expect(updated.id).toBe(created.id);
        expect(updated.name).toBe('John Updated');
        expect(updated.age).toBe(31);
        
        // Verify with a fresh find
        const found = await testORM.findUnique(TestUser, { email: 'john@example.com' });
        expect(found?.name).toBe('John Updated');
        expect(found?.age).toBe(31);
      });
      
      it('should throw if entity has no ID', async () => {
        const user = new TestUser();
        user.name = 'John Doe';
        user.age = 30;
        
        await expect(testORM.update(user)).rejects.toThrow('Cannot update entity without ID');
      });
    });
    
    describe('delete', () => {
      it('should delete an entity', async () => {
        // Create a user first
        const user = new TestUser();
        user.name = 'John Doe';
        user.email = 'john@example.com';
        user.username = 'johndoe';
        user.age = 30;
        const created = await testORM.create(user);
        
        // Delete the user
        await testORM.delete(created);
        
        // Verify deletion
        const found = await testORM.findUnique(TestUser, { email: 'john@example.com' });
        expect(found).toBeNull();
      });
      
      it('should throw if entity has no ID', async () => {
        const user = new TestUser();
        user.name = 'John Doe';
        user.age = 30;
        
        await expect(testORM.delete(user)).rejects.toThrow('Cannot delete entity without ID');
      });
    });
    
    describe('raw', () => {
      it('should execute raw queries', async () => {
        // Insert data with raw query
        await testORM.raw(
          `CREATE ${TEST_TABLE} SET name = $name, email = $email, username = $username, age = $age`,
          { 
            name: 'Raw User',
            email: 'raw@example.com',
            username: 'rawuser',
            age: 30
          }
        );
        
        // Query the data
        const result = await testORM.raw(
          `SELECT * FROM ${TEST_TABLE} WHERE email = $email`,
          { email: 'raw@example.com' }
        );
        
        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        
        // SurrealDB returns an array of results, where each result is an array of records
        const records = result[0];
        expect(Array.isArray(records)).toBe(true);
        expect(records.length).toBeGreaterThan(0);
        
        const user = records[0];
        expect(user).toBeDefined();
        expect(user.name).toBe('Raw User');
        expect(user.email).toBe('raw@example.com');
        expect(user.username).toBe('rawuser');
        expect(user.age).toBe(30);
      });
    });
    
    describe('upsert', () => {
      it('should create a new entity if it does not exist', async () => {
        const user = new TestUser();
        user.name = 'New User';
        user.email = 'new@example.com';
        user.username = 'newuser';
        user.age = 30;
        
        const result = await testORM.upsert(user, 'email');
        
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe('New User');
        expect(result.email).toBe('new@example.com');
        expect(result.username).toBe('newuser');
        expect(result.age).toBe(30);
      });
      
      it('should update an existing entity if it exists', async () => {
        // Create initial user
        const user = new TestUser();
        user.name = 'Original User';
        user.email = 'existing@example.com';
        user.username = 'existing';
        user.age = 30;
        await testORM.create(user);
        
        // Upsert the same email with different name
        const updateUser = new TestUser();
        updateUser.name = 'Updated User';
        updateUser.email = 'existing@example.com';
        updateUser.username = 'existing';
        updateUser.age = 31;
        
        const result = await testORM.upsert(updateUser, 'email');
        
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe('Updated User');
        expect(result.email).toBe('existing@example.com');
        expect(result.username).toBe('existing');
        expect(result.age).toBe(31);
      });
    });
  });
}); 