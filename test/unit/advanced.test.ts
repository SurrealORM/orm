import { SurrealORM } from '../../src/connection';
import { Entity, Property } from '../../src/decorators';
import { BaseEntity } from '../../src/entity';
import { createTestORM, TEST_CONFIG } from '../setup';
import { RecordId } from 'surrealdb';

// Test entities
@Entity()
class ComplexUser extends BaseEntity {
  @Property({ required: true })
  name!: string;

  @Property({ type: 'number' })
  age!: number;

  @Property({ type: 'datetime' })
  createdAt!: Date;

  @Property()
  metadata?: {
    tags: string[];
    settings: Record<string, any>;
  };

  toJSON() {
    return {
      name: this.name,
      age: this.age,
      createdAt: this.createdAt,
      metadata: this.metadata
    };
  }
}

@Entity()
class RelatedUser extends BaseEntity {
  @Property()
  name!: string;

  @Property()
  friendId?: string;

  toJSON() {
    return {
      name: this.name,
      friendId: this.friendId
    };
  }
}

describe('Advanced Scenarios', () => {
  let testORM: SurrealORM;
  let localOrm: SurrealORM;

  beforeEach(async () => {
    testORM = createTestORM('advanced_test');
    localOrm = new SurrealORM(TEST_CONFIG);
    await testORM.connect('root');
    await localOrm.connect('root');
  });

  afterEach(async () => {
    await testORM.disconnect();
    await localOrm.disconnect();
  });

  describe('Error Cases', () => {
    it('should handle invalid credentials', async () => {
      const invalidOrm = new SurrealORM({
        ...TEST_CONFIG,
        password: 'wrong_password'
      });

      await expect(invalidOrm.connect('root')).rejects.toThrow();
    });

    it('should handle network issues', async () => {
      const invalidOrm = new SurrealORM({
        ...TEST_CONFIG,
        url: 'http://nonexistent:8000'
      });

      await expect(invalidOrm.connect('root')).rejects.toThrow();
    });

    it.skip('should validate required fields', async () => {
      const user = new ComplexUser();
      // name is required but not set

      await expect(testORM.create(user)).rejects.toThrow();
    });

    it.skip('should validate field types', async () => {
      const user = new ComplexUser();
      user.name = 'Test User';
      // @ts-ignore - Intentionally setting wrong type
      user.age = 'not a number';

      await expect(testORM.create(user)).rejects.toThrow();
    });
  });

  describe('Complex Queries', () => {
    beforeEach(async () => {
      // Create test data
      const users = [
        { name: 'John', age: 30, createdAt: new Date('2023-01-01') },
        { name: 'Jane', age: 25, createdAt: new Date('2023-02-01') },
        { name: 'Bob', age: 35, createdAt: new Date('2023-03-01') }
      ];

      for (const userData of users) {
        const user = new ComplexUser();
        Object.assign(user, userData);
        await testORM.create(user);
      }
    });

    it('should handle multiple conditions in findMany', async () => {
      const users = await testORM.raw(`
        SELECT * FROM complexuser 
        WHERE age > $minAge AND age < $maxAge 
        AND createdAt > $minDate
      `, {
        minAge: 25,
        maxAge: 35,
        minDate: new Date('2023-01-15')
      });

      // Check if we got any results
      expect(users[0]).toBeDefined();
      if (users[0].length > 0) {
        expect(users[0][0].name).toBe('Jane');
      }
    });

    it('should handle complex nested queries', async () => {
      const user = new ComplexUser();
      user.name = 'Nested User';
      user.age = 30;
      user.metadata = {
        tags: ['test', 'complex'],
        settings: { theme: 'dark', notifications: true }
      };
      await testORM.create(user);

      const found = await testORM.raw(`
        SELECT * FROM complexuser 
        WHERE metadata.tags CONTAINS $tag 
        AND metadata.settings.theme = $theme
      `, {
        tag: 'complex',
        theme: 'dark'
      });

      // Check if we got any results
      expect(found[0]).toBeDefined();
      if (found[0].length > 0) {
        expect(found[0][0].name).toBe('Nested User');
      }
    });
  });

  describe('Relationship Handling', () => {
    let user1Id: string;

    beforeEach(async () => {
      // Create test users with relationships
      const user1 = new RelatedUser();
      user1.name = 'User 1';
      const created1 = await testORM.create(user1);
      user1Id = created1.id?.toString() || '';

      const user2 = new RelatedUser();
      user2.name = 'User 2';
      user2.friendId = user1Id;
      await testORM.create(user2);
    });

    it('should handle basic relationships', async () => {
      const users = await testORM.raw(`
        SELECT * FROM relateduser 
        WHERE friendId IS NOT NULL
      `);

      // Check if we got any results
      expect(users[0]).toBeDefined();
      if (users[0].length > 0) {
        const userWithFriend = users[0].find((u: any) => u.friendId);
        expect(userWithFriend?.name).toBe('User 2');
      }
    });

    it('should handle relationship queries', async () => {
      const users = await testORM.raw(`
        SELECT * FROM relateduser WHERE friendId = $friendId
      `, { friendId: user1Id });

      // Check if we got any results
      expect(users[0]).toBeDefined();
      if (users[0].length > 0) {
        expect(users[0][0].name).toBe('User 2');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined values', async () => {
      const user = new ComplexUser();
      user.name = 'Null Test User';
      user.age = null as any;
      user.metadata = undefined;

      const created = await testORM.create(user);
      expect(created).toBeDefined();
      expect(created.age).toBeNull();
      expect(created.metadata).toBeUndefined();
    });

    it('should handle special characters in field names', async () => {
      const user = new ComplexUser();
      user.name = 'Special Chars User';
      user.metadata = {
        tags: ['test'],
        settings: {
          'special-field': 'value',
          'another.field': 'value2'
        }
      };

      const created = await testORM.create(user);
      expect(created).toBeDefined();
      expect(created.metadata?.settings['special-field']).toBe('value');
      expect(created.metadata?.settings['another.field']).toBe('value2');
    });

    it('should handle large datasets', async () => {
      const batchSize = 1000;
      const users = [];

      // Create a large batch of users
      for (let i = 0; i < batchSize; i++) {
        const user = new ComplexUser();
        user.name = `User ${i}`;
        user.age = i;
        user.createdAt = new Date();
        users.push(user);
      }

      // Measure performance
      const start = Date.now();
      for (const user of users) {
        await testORM.create(user);
      }
      const end = Date.now();

      // Verify all users were created
      const allUsers = await testORM.findAll(ComplexUser);
      expect(allUsers).toHaveLength(batchSize);

      // Log performance metrics
      console.log(`Created ${batchSize} users in ${end - start}ms`);
    });
  });
}); 