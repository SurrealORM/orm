import { createTestORM, setupTestDatabase } from './setup';

export default async () => {
  const orm = createTestORM();
  try {
    await setupTestDatabase(orm);
    await orm.disconnect();
    console.log('✅ Connected to SurrealDB for testing');
  } catch (error) {
    console.error('❌ Failed to connect to SurrealDB:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}; 