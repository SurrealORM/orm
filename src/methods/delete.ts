import { BaseEntity } from '../entity';
import { SurrealORM } from '../connection';

/**
 * Delete a record from the database
 * @param this - The SurrealORM instance
 * @param entity - The entity to delete
 * @throws Error if entity has no ID
 */
export async function delete_<T extends BaseEntity>(
  this: SurrealORM,
  entity: T
): Promise<void> {
  if (!this.client) {
    throw new Error('Not connected to SurrealDB');
  }

  if (!entity.id) {
    throw new Error('Cannot delete entity without ID');
  }

  await this.client.delete(entity.id);
} 