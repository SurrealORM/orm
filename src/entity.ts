import { ENTITY_METADATA_KEY, PROPERTY_METADATA_KEY } from "./decorators";
import type { RecordId } from "surrealdb";
import { getMetadata } from "./metadata";

/**
 * Base class for all entities in the ORM
 * @class BaseEntity
 */
export class BaseEntity {
	/** The unique identifier for the entity */
	id!: string | RecordId<string>;

	/**
	 * Gets the table name for the entity
	 * @returns The table name as defined in the @Entity decorator
	 * @throws Error if the entity is not decorated with @Entity
	 */
	static getTableName(): string {
		const metadata = getMetadata(ENTITY_METADATA_KEY, BaseEntity);
		if (!metadata) {
			throw new Error(
				`Entity ${BaseEntity.name} is not decorated with @Entity`,
			);
		}
		return metadata.table;
	}

	/**
	 * Gets the property metadata for the entity
	 * @returns Object containing property metadata
	 */
	static getProperties(): Record<string, any> {
		return getMetadata(PROPERTY_METADATA_KEY, BaseEntity) || {};
	}

	/**
	 * Converts the entity to a plain JSON object
	 * @returns Object containing all entity properties except id
	 */
	toJSON(): Record<string, any> {
		const json: Record<string, any> = {};
		for (const key in this) {
			if (Object.prototype.hasOwnProperty.call(this, key) && key !== "id") {
				json[key] = (this as any)[key];
			}
		}
		return json;
	}
}
