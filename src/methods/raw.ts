import type { SurrealORM } from "../connection";

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
	params?: Record<string, any>,
): Promise<T> {
	if (!this.client) {
		throw new Error("Not connected to SurrealDB");
	}

	const result = await this.client.query(query, params);
	
	// Handle different response formats from SurrealDB
	if (Array.isArray(result) && result.length > 0) {
		// If result is an array with a 'result' property (as expected in some versions)
		const firstResult = result[0] as any;
		if (firstResult && typeof firstResult.result !== 'undefined') {
			return firstResult.result as T;
		}
		// If result is a direct array of results (common in newer versions)
		return firstResult as T;
	}
	
	// If single result or another format
	return result as T;
}
