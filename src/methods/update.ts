import { RecordId } from 'surrealdb';
import { BaseEntity } from '../entity';
import { SurrealRecord } from '../types';
import { SurrealORM } from '../connection';

/**
 * Update an existing record
 * @param this - The SurrealORM instance
 * @param entity - The entity to update
 * @returns The updated entity
 * @throws Error if entity has no ID
 */
export async function update<T extends BaseEntity>(
  this: SurrealORM,
  entity: T
): Promise<T> {
  if (!this.client) {
    throw new Error('Not connected to SurrealDB');
  }

  if (!entity.id) {
    throw new Error('Cannot update entity without ID');
  }

  const tableName = (entity.constructor as typeof BaseEntity).getTableName();
  const recordId = typeof entity.id === 'string' ? new RecordId(tableName, entity.id) : entity.id;
  const result = await this.client.update(recordId, entity.toJSON()) as unknown as SurrealRecord;
  return Object.assign(entity, result);
} 