import { ENTITY_METADATA_KEY, PROPERTY_METADATA_KEY } from "./decorators";
import type { RecordId } from "surrealdb";
import { getMetadata } from "./metadata";
import { Entity } from "./decorators";

/**
 * Base class for all entities in the ORM
 * @class BaseEntity
 */
@Entity({ table: 'base_entity' })
export class BaseEntity {
	/** The unique identifier for the entity */
	id!: string | RecordId<string>;

	/**
	 * Gets the table name for the entity
	 * @returns The table name as defined in the @Entity decorator
	 * @throws Error if the entity is not decorated with @Entity
	 */
	static getTableName(): string {
		// Only check for own metadata, not inherited
		const ownMetadata = Reflect && typeof Reflect.getOwnMetadata === 'function'
			? Reflect.getOwnMetadata(ENTITY_METADATA_KEY, this)
			: undefined;
		if (!ownMetadata) {
			throw new Error(
				`Entity ${this.name} is not decorated with @Entity`,
			);
		}
		return ownMetadata.table;
	}

	/**
	 * Gets the property metadata for the entity
	 * @returns Object containing property metadata
	 */
	static getProperties(): Record<string, any> {
		return getMetadata(PROPERTY_METADATA_KEY, this) || {};
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
