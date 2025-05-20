require('reflect-metadata');
const { Entity, Property, ENTITY_METADATA_KEY, PROPERTY_METADATA_KEY } = require('../../src/decorators');
const { clearMetadata, User } = require('../test-helpers');

describe('Decorators', () => {
  afterEach(() => {
    clearMetadata();
  });

  describe('@Entity', () => {
    it('should set the correct table name when provided', () => {
      @Entity({ table: 'custom_table' })
      class TestEntity {}

      const metadata = Reflect.getMetadata(ENTITY_METADATA_KEY, TestEntity);
      expect(metadata).toBeDefined();
      expect(metadata.table).toBe('custom_table');
    });

    it('should use the class name as table name when not provided', () => {
      @Entity()
      class AnotherEntity {}

      const metadata = Reflect.getMetadata(ENTITY_METADATA_KEY, AnotherEntity);
      expect(metadata).toBeDefined();
      expect(metadata.table).toBe('anotherentity');
    });
  });

  describe('@Property', () => {
    it('should set the correct property metadata with default values', () => {
      // The User class from test-helpers already has decorators
      const properties = Reflect.getMetadata(PROPERTY_METADATA_KEY, User);
      
      expect(properties).toBeDefined();
      expect(properties.name).toBeDefined();
      expect(properties.name.required).toBe(false);
      expect(properties.name.unique).toBe(false);
      expect(properties.name.index).toBe(false);
    });

    it('should set unique property correctly', () => {
      const properties = Reflect.getMetadata(PROPERTY_METADATA_KEY, User);
      
      expect(properties.email).toBeDefined();
      expect(properties.email.unique).toBe(true);
    });

    it('should set index property correctly', () => {
      const properties = Reflect.getMetadata(PROPERTY_METADATA_KEY, User);
      
      expect(properties.username).toBeDefined();
      expect(properties.username.index).toBe(true);
    });

    it('should correctly set a custom type if provided', () => {
      class TypeTest {
        @Property({ type: 'datetime' })
        dateField!: Date;
      }

      const properties = Reflect.getMetadata(PROPERTY_METADATA_KEY, TypeTest);
      expect(properties.dateField).toBeDefined();
      expect(properties.dateField.type).toBe('datetime');
    });
  });
}); 