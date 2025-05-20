import { createTestORM, teardownTestDatabase } from './setup';

export default async () => {
  const orm = createTestORM();
  try {
    await teardownTestDatabase(orm);
    console.log('✅ Disconnected from SurrealDB');
  } catch (error) {
    console.error('❌ Error during teardown:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}; 