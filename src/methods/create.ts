import type { BaseEntity } from "../entity";
import type { SurrealORM } from "../connection";
import type { SurrealRecord } from "../types";

/**
 * Create a new record in the database
 * @param this - The SurrealORM instance
 * @param entity - The entity to create
 * @returns The created entity with its ID
 */
export async function create<T extends BaseEntity>(
	this: SurrealORM,
	entity: T,
): Promise<T> {
	if (!this.client) {
		throw new Error("Not connected to SurrealDB");
	}

	const table = (entity.constructor as typeof BaseEntity).getTableName();
	const result = await this.client.create(table, entity.toJSON()) as SurrealRecord[];
	const record = result[0];
	if (!record) {
		throw new Error("Failed to create record");
	}
	entity.id = record.id.toString();
	return Object.assign(entity, record) as T;
}
