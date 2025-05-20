require('reflect-metadata');
const { getMetadata, defineMetadata } = require('../../src/metadata');

describe('Metadata Helpers', () => {
  class TestClass {
    testProperty: string = '';
  }
  
  const testInstance = new TestClass();

  afterEach(() => {
    // Clean up metadata after each test
    Reflect.deleteMetadata('test:key', TestClass);
    Reflect.deleteMetadata('test:property:key', TestClass, 'testProperty');
  });

  describe('defineMetadata', () => {
    it('should define class metadata correctly', () => {
      defineMetadata('test:key', { value: 'test' }, TestClass);
      const metadata = Reflect.getMetadata('test:key', TestClass);
      
      expect(metadata).toBeDefined();
      expect(metadata.value).toBe('test');
    });

    it('should define property metadata correctly', () => {
      defineMetadata('test:property:key', { value: 'property test' }, TestClass, 'testProperty');
      const metadata = Reflect.getMetadata('test:property:key', TestClass, 'testProperty');
      
      expect(metadata).toBeDefined();
      expect(metadata.value).toBe('property test');
    });

    it('should overwrite existing metadata', () => {
      defineMetadata('test:key', { value: 'original' }, TestClass);
      defineMetadata('test:key', { value: 'overwritten' }, TestClass);
      const metadata = Reflect.getMetadata('test:key', TestClass);
      
      expect(metadata.value).toBe('overwritten');
    });
  });

  describe('getMetadata', () => {
    it('should get class metadata correctly', () => {
      Reflect.defineMetadata('test:key', { value: 'test' }, TestClass);
      const metadata = getMetadata('test:key', TestClass);
      
      expect(metadata).toBeDefined();
      expect(metadata.value).toBe('test');
    });

    it('should get property metadata correctly', () => {
      Reflect.defineMetadata('test:property:key', { value: 'property test' }, TestClass, 'testProperty');
      const metadata = getMetadata('test:property:key', TestClass, 'testProperty');
      
      expect(metadata).toBeDefined();
      expect(metadata.value).toBe('property test');
    });

    it('should return undefined for non-existent metadata', () => {
      const metadata = getMetadata('non:existent', TestClass);
      expect(metadata).toBeUndefined();
    });
  });
}); 