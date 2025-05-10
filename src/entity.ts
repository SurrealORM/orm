import { ENTITY_METADATA_KEY, PROPERTY_METADATA_KEY } from './decorators';
import { RecordId } from 'surrealdb';

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
    const metadata = Reflect.getMetadata(ENTITY_METADATA_KEY, this);
    if (!metadata) {
      throw new Error(`Entity ${this.name} is not decorated with @Entity`);
    }
    return metadata.table;
  }

  /**
   * Gets the property metadata for the entity
   * @returns Object containing property metadata
   */
  static getProperties(): Record<string, any> {
    return Reflect.getMetadata(PROPERTY_METADATA_KEY, this) || {};
  }

  /**
   * Converts the entity to a plain JSON object
   * @returns Object containing all entity properties except id
   */
  toJSON(): Record<string, any> {
    const json: Record<string, any> = {};
    for (const key in this) {
      if (this.hasOwnProperty(key) && key !== 'id') {
        json[key] = (this as any)[key];
      }
    }
    return json;
  }
} 