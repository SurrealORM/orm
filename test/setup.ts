import 'reflect-metadata';
import { SurrealORM } from '../src/connection';

// Set default test configuration
const TEST_CONFIG = {
  url: process.env.SURREAL_URL || 'http://localhost:8000/rpc',
  namespace: process.env.SURREAL_NAMESPACE || 'test',
  database: process.env.SURREAL_DATABASE || 'test',
  username: process.env.SURREAL_USERNAME || 'root',
  password: process.env.SURREAL_PASSWORD || 'root'
};

// Helper to create a new ORM instance with a unique database
export function createTestORM(testName?: string) {
  const uniqueDb = testName ? `test_${testName}_${Date.now()}` : 'test';
  return new SurrealORM({
    ...TEST_CONFIG,
    database: uniqueDb
  });
}

// Setup function to prepare the test database (schema, etc.)
export async function setupTestDatabase(orm: SurrealORM) {
  try {
    // Test if connection works
    await orm.connect('root'); // Connect as root first
    try {
      // Create namespace and database
      try {
        await orm.raw('DEFINE NAMESPACE test');
      } catch (error) {
        if (!(error instanceof Error && error.message.includes('already exists'))) {
          throw error;
        }
      }
      try {
        await orm.raw(`DEFINE DATABASE ${orm.options.database}`);
      } catch (error) {
        if (!(error instanceof Error && error.message.includes('already exists'))) {
          throw error;
        }
      }
      // Switch to the test database
      await orm.raw('USE NAMESPACE test');
      await orm.raw(`USE DATABASE ${orm.options.database}`);
      
      // Create test tables and define schema
      try {
        await orm.raw('DEFINE TABLE test_users SCHEMALESS');
        await orm.raw('DEFINE FIELD email ON test_users TYPE string');
        await orm.raw('DEFINE FIELD name ON test_users TYPE string');
        await orm.raw('DEFINE FIELD age ON test_users TYPE int');
        await orm.raw('DEFINE FIELD username ON test_users TYPE string');
        await orm.raw('DEFINE INDEX idx_email ON test_users COLUMNS email UNIQUE');
        await orm.raw('DEFINE INDEX idx_username ON test_users COLUMNS username UNIQUE');
      } catch (error) {
        // Ignore if table/fields already exist
      }
    } catch (error) {
      console.error('Failed to setup database schema:', (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  } catch (error) {
    console.error('Failed to initialize database:', (error instanceof Error ? error.message : String(error)));
    throw error;
  }
}

// Teardown function
export async function teardownTestDatabase(orm: SurrealORM) {
  try {
    // Remove the entire database to clean up
    await orm.raw(`REMOVE DATABASE ${orm.options.database}`);
    await orm.disconnect();
  } catch (error) {
    console.warn('Error during teardown:', (error instanceof Error ? error.message : String(error)));
  }
}

export { TEST_CONFIG }; 