const API = require('../../mod');
const { Entity, Property, BaseEntity, SurrealORM } = require('../../src');
const { create } = require('../../src/methods/create');
const { findUnique, findMany, findAll } = require('../../src/methods/find');
const { update } = require('../../src/methods/update');
const { delete_ } = require('../../src/methods/delete');
const { raw } = require('../../src/methods/raw');
const { upsert } = require('../../src/methods/upsert');

describe('Module Exports', () => {
  it('should export all core classes correctly', () => {
    expect(API.SurrealORM).toBe(SurrealORM);
    expect(API.BaseEntity).toBe(BaseEntity);
    expect(API.Entity).toBe(Entity);
    expect(API.Property).toBe(Property);
  });

  it('should export all methods correctly', () => {
    expect(API.create).toBe(create);
    expect(API.findUnique).toBe(findUnique);
    expect(API.findMany).toBe(findMany);
    expect(API.findAll).toBe(findAll);
    expect(API.update).toBe(update);
    expect(API.delete).toBe(delete_);
    expect(API.raw).toBe(raw);
    expect(API.upsert).toBe(upsert);
  });

  it('should export all type definitions', () => {
    // Types cannot be checked at runtime, but we can ensure they are defined
    expect(typeof API).toBe('object');
    
    // The test passes if the code compiles, as TypeScript will verify the types exist
    // We can do a basic check to ensure the export object has all expected properties
    const expectedExports = [
      'SurrealORM',
      'BaseEntity',
      'Entity',
      'Property',
      'create',
      'findUnique',
      'findMany',
      'findAll',
      'update',
      'delete',
      'raw',
      'upsert'
    ];
    
    expectedExports.forEach(exportName => {
      expect(API).toHaveProperty(exportName);
    });
  });
}); 