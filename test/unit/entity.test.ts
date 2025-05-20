import { BaseEntity } from '../../src/entity';
import { Entity, Property } from '../../src/decorators';
import { User, TestUser } from '../test-helpers';

describe('BaseEntity', () => {
  describe('getTableName', () => {
    it('should return the correct table name', () => {
      const tableName = TestUser.getTableName();
      expect(tableName).toBe('users');
    });

    it('should throw if entity is not decorated with @Entity', () => {
      class UndecoratedEntity extends BaseEntity {}
      
      expect(() => {
        // @ts-ignore - Accessing static method on class
        UndecoratedEntity.getTableName();
      }).toThrow('Entity UndecoratedEntity is not decorated with @Entity');
    });
  });

  describe('getProperties', () => {
    it('should return the entity property metadata', () => {
      const properties = TestUser.getProperties();
      
      expect(properties).toBeDefined();
      expect(properties.email).toBeDefined();
      expect(properties.email.unique).toBe(true);
      expect(properties.name).toBeDefined();
      expect(properties.username).toBeDefined();
      expect(properties.username.index).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should convert the entity to a plain object excluding id', () => {
      const user = new User();
      user.id = 'users:123';
      user.name = 'Test User';
      user.email = 'test@example.com';
      user.age = 30;
      user.username = 'testuser';

      const json = user.toJSON();
      
      expect(json).toEqual({
        name: 'Test User',
        email: 'test@example.com',
        age: 30,
        username: 'testuser'
      });
      expect(json.id).toBeUndefined();
    });

    it('should handle nested properties correctly', () => {
      @Entity()
      class NestedEntity extends BaseEntity {
        @Property()
        name!: string;
        
        nested = {
          value: 'nested value'
        };
      }

      const entity = new NestedEntity();
      entity.id = 'nested:123';
      entity.name = 'Test Entity';
      
      const json = entity.toJSON();
      
      expect(json).toEqual({
        name: 'Test Entity',
        nested: {
          value: 'nested value'
        }
      });
    });
  });
}); 