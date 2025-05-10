import { BaseEntity } from '../entity';
import { EntityClass, FindUniqueWhere, FindManyWhere } from '../types';
import { SurrealORM } from '../connection';
import { PROPERTY_METADATA_KEY } from '../decorators';
import { RecordId } from 'surrealdb';

/**
 * Interface for query results from SurrealDB
 * @interface QueryResult
 * @template T - The type of the result
 */
type QueryResult<T> = T[];

/**
 * Find a single record by unique field values
 * @param this - The SurrealORM instance
 * @param entityClass - The entity class to find
 * @param where - The where clause containing unique field values
 * @returns The found entity or null if not found
 * @throws Error if not connected to SurrealDB or if fields are not unique
 */
export async function findUnique<T extends BaseEntity>(
  this: SurrealORM,
  entityClass: EntityClass<T>,
  where: FindUniqueWhere<T>
): Promise<T | null> {
  if (!this.client) {
    throw new Error('Not connected to SurrealDB');
  }

  // Check if all fields in where clause are marked as unique
  const properties = Reflect.getMetadata(PROPERTY_METADATA_KEY, entityClass) || {};
  const whereFields = Object.keys(where);
  
  for (const field of whereFields) {
    // Skip id field as it's always unique in SurrealDB
    if (field === 'id') continue;
    
    if (!properties[field]?.unique) {
      throw new Error(`Field ${field} is not marked as unique. Only fields decorated with @Property({ unique: true }) can be used with findUnique.`);
    }
  }

  const table = entityClass.getTableName();
  const conditions = whereFields.map(field => {
    if (field === 'id') {
      return 'id = type::thing($table, $id)';
    }
    return `${field} = $${field}`;
  }).join(' AND ');
  
  const query = `SELECT * FROM ${table} WHERE ${conditions} LIMIT 1`;
  
  // Create params object with field names as keys
  const params = Object.fromEntries(
    whereFields.map(field => {
      const value = where[field as keyof T];
      if (field === 'id') {
        // Convert RecordId to string if needed
        if (value instanceof RecordId) {
          return [field, value.id];
        }
        return [field, value];
      }
      return [field, value];
    })
  );

  // Add table name to params
  const finalParams = {
    table,
    ...params
  };

  console.log('FindUnique Query:', query);
  console.log('FindUnique Params:', finalParams);
  
  const result = await this.client.query(query, finalParams) as [QueryResult<any>];
  console.log('FindUnique Result:', result);

  if (!result?.[0]?.[0]) {
    return null;
  }

  const record = result[0][0];
  const entity = new entityClass();
  Object.assign(entity, record);
  return entity as T;
}

/**
 * Find multiple records by field values
 * @param this - The SurrealORM instance
 * @param entityClass - The entity class to find
 * @param where - The where clause containing field values
 * @returns Array of found entities
 * @throws Error if not connected to SurrealDB
 */
export async function findMany<T extends BaseEntity>(
  this: SurrealORM,
  entityClass: EntityClass<T>,
  where: FindManyWhere<T>
): Promise<T[]> {
  if (!this.client) {
    throw new Error('Not connected to SurrealDB');
  }

  const table = entityClass.getTableName();
  const whereFields = Object.keys(where);
  const conditions = whereFields.map(field => {
    if (field === 'id') {
      return 'id = type::thing($table, $id)';
    }
    return `${field} = $${field}`;
  }).join(' AND ');
  
  const query = `SELECT * FROM ${table} WHERE ${conditions}`;
  
  // Create params object with field names as keys
  const params = Object.fromEntries(
    whereFields.map(field => {
      const value = where[field as keyof T];
      if (field === 'id') {
        // Convert RecordId to string if needed
        if (value instanceof RecordId) {
          return [field, value.id];
        }
        return [field, value];
      }
      return [field, value];
    })
  );

  // Add table name to params
  const finalParams = {
    table,
    ...params
  };

  console.log('FindMany Query:', query);
  console.log('FindMany Params:', finalParams);
  
  const result = await this.client.query(query, finalParams) as [QueryResult<any>];
  console.log('FindMany Result:', result);

  if (!result?.[0]) {
    return [];
  }

  return result[0].map((record: any) => {
    const entity = new entityClass();
    Object.assign(entity, record);
    return entity;
  });
}

/**
 * Find all records of an entity type
 * @param this - The SurrealORM instance
 * @param entityClass - The entity class to find
 * @returns Array of all entities
 * @throws Error if not connected to SurrealDB
 */
export async function findAll<T extends BaseEntity>(
  this: SurrealORM,
  entityClass: EntityClass<T>
): Promise<T[]> {
  if (!this.client) {
    throw new Error('Not connected to SurrealDB');
  }

  const table = entityClass.getTableName();
  const query = `SELECT * FROM ${table}`;
  const result = await this.client.query(query) as [QueryResult<any>];

  if (!result?.[0]) {
    return [];
  }

  return result[0].map((record: any) => {
    const entity = new entityClass();
    Object.assign(entity, record);
    return entity;
  });
} 