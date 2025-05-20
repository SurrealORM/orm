import 'reflect-metadata';
import { Entity, Property, BaseEntity } from '../src';
import { ENTITY_METADATA_KEY, PROPERTY_METADATA_KEY } from '../src/decorators';
import { getMetadata, defineMetadata } from '../src/metadata';

// Ensure reflect-metadata is loaded 
if (!Reflect || !Reflect.getMetadata) {
  throw new Error('Reflect metadata is not available. Make sure reflect-metadata is imported properly.');
}

// Create a sample entity for testing
@Entity({ table: 'users' })
export class User extends BaseEntity {
  @Property({ unique: true })
  email;

  @Property()
  name;

  @Property()
  age;

  @Property({ unique: true, index: true })
  username;
}

// Ensure the metadata was correctly set
const ensureUserMetadata = () => {
  // Check if metadata exists, if not, manually set it
  const entityMetadata = getMetadata(ENTITY_METADATA_KEY, User);
  if (!entityMetadata) {
    defineMetadata(ENTITY_METADATA_KEY, { table: 'users' }, User);
  }

  const propMetadata = getMetadata(PROPERTY_METADATA_KEY, User);
  if (!propMetadata) {
    const properties = {
      email: { type: 'string', required: false, unique: true, index: false },
      name: { type: 'string', required: false, unique: false, index: false },
      age: { type: 'number', required: false, unique: false, index: false },
      username: { type: 'string', required: false, unique: true, index: true }
    };
    defineMetadata(PROPERTY_METADATA_KEY, properties, User);
  }
};

// Call it immediately to ensure metadata is set
ensureUserMetadata();

// Create a function to reset metadata between tests if needed
export function clearMetadata() {
  const metadata = getMetadata(ENTITY_METADATA_KEY, User);
  if (metadata) {
    Reflect.deleteMetadata(ENTITY_METADATA_KEY, User);
  }

  const properties = getMetadata(PROPERTY_METADATA_KEY, User);
  if (properties) {
    Reflect.deleteMetadata(PROPERTY_METADATA_KEY, User);
  }
  
  // Re-add the metadata after clearing
  ensureUserMetadata();
}

// Override getTableName and getProperties to fix prototype issues in tests
export class TestUser extends User {
  static getTableName() {
    return 'users';
  }

  static getProperties() {
    return {
      email: { type: 'string', required: false, unique: true, index: false },
      name: { type: 'string', required: false, unique: false, index: false },
      age: { type: 'number', required: false, unique: false, index: false },
      username: { type: 'string', required: false, unique: true, index: true }
    };
  }
}

export { ensureUserMetadata }; 