import { SurrealORM } from '../connection';

interface QueryResult<T> {
  result: T;
}

/**
 * Execute a raw SurrealQL query
 * @param this - The SurrealORM instance
 * @param query - The SurrealQL query to execute
 * @param params - Optional parameters for the query
 * @returns The query results
 */
export async function raw<T = any>(
  this: SurrealORM,
  query: string,
  params?: Record<string, any>
): Promise<T> {
  if (!this.client) {
    throw new Error('Not connected to SurrealDB');
  }

  const result = await this.client.query(query, params) as [QueryResult<T>];
  return result[0].result;
} 