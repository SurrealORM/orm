import { BaseEntity } from '../entity';
import { SurrealRecord } from '../types';
import { SurrealORM } from '../connection';

/**
 * Create a new record or update an existing one based on unique fields
 * @param this - The SurrealORM instance
 * @param entity - The entity to upsert
 * @param uniqueFields - Field names that should be used to identify existing records
 * @returns The upserted entity
 */
export async function upsert<T extends BaseEntity>(
  this: SurrealORM,
  entity: T,
  ...uniqueFields: (keyof T)[]
): Promise<T> {
  if (!this.client) {
    throw new Error('Not connected to SurrealDB');
  }

  const table = (entity.constructor as typeof BaseEntity).getTableName();
  const conditions = uniqueFields.map(field => `${String(field)} = $${String(field)}`).join(' AND ');
  const query = `SELECT * FROM ${table} WHERE ${conditions} LIMIT 1`;
  const params = Object.fromEntries(uniqueFields.map(field => [field, entity[field]]));
  
  const result = await this.client.query(query, params) as [{ result: SurrealRecord[] }];
  const existing = result[0].result?.[0];

  if (existing) {
    entity.id = existing.id.toString();
    return this.update(entity) as Promise<T>;
  }

  return this.create(entity) as Promise<T>;
} 