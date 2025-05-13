import { getMetadata, defineMetadata } from './metadata';

/**
 * Metadata key for entity decorator
 * @constant
 */
export const ENTITY_METADATA_KEY = "surrealorm:entity";

/**
 * Metadata key for property decorator
 * @constant
 */
export const PROPERTY_METADATA_KEY = "surrealorm:property";

/**
 * Options for entity decorator
 * @interface EntityOptions
 */
export interface EntityOptions {
	/** Custom table name (defaults to class name in lowercase) */
	table?: string;
}

/**
 * Options for property decorator
 * @interface PropertyOptions
 */
export interface PropertyOptions {
	/** Custom type for the property */
	type?: string;
	/** Whether the property is required */
	required?: boolean;
	/** Whether the property is unique */
	unique?: boolean;
	/** Whether the property should be indexed */
	index?: boolean;
}

/**
 * Decorator to mark a class as a SurrealDB entity
 * @param options - Optional configuration for the entity
 * @returns Class decorator function
 */
export function Entity(options: EntityOptions = {}): ClassDecorator {
	return (target: any) => {
		defineMetadata(
			ENTITY_METADATA_KEY,
			{
				table: options.table || target.name.toLowerCase(),
			},
			target,
		);
	};
}

/**
 * Decorator to mark a property as a SurrealDB field
 * @param options - Optional configuration for the property
 * @returns Property decorator function
 */
export function Property(options: PropertyOptions = {}): PropertyDecorator {
	return (target: any, propertyKey: string | symbol) => {
		const properties =
			getMetadata(PROPERTY_METADATA_KEY, target.constructor) || {};
		properties[propertyKey.toString()] = {
			type:
				options.type ||
				getMetadata(
					"design:type",
					target,
					propertyKey,
				)?.name?.toLowerCase(),
			required: options.required ?? false,
			unique: options.unique ?? false,
			index: options.index ?? false,
		};
		defineMetadata(
			PROPERTY_METADATA_KEY,
			properties,
			target.constructor,
		);
	};
}
