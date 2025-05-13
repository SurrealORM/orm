import type { RecordId } from "surrealdb";
import type { BaseEntity } from "./entity";

/**
 * Options for configuring the SurrealORM connection
 * @interface SurrealORMOptions
 */
export interface SurrealORMOptions {
	/** The URL of the SurrealDB instance */
	url: string;
	/** The namespace to use */
	namespace: string;
	/** The database to use */
	database: string;
	/** Optional username for authentication */
	username?: string;
	/** Optional password for authentication */
	password?: string;
}

/**
 * Interface representing a record returned from SurrealDB
 * @interface SurrealRecord
 */
export interface SurrealRecord {
	/** The record ID */
	id: RecordId<string>;
	/** Additional record properties */
	[key: string]: any;
}

/**
 * Type to get only data fields from an entity (excluding methods)
 * @template T - The entity type extending BaseEntity
 * @returns Union type of all non-function property keys
 */
export type EntityFields<T extends BaseEntity> = {
	[K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

/**
 * Type to get the value type for a specific field
 * @template T - The entity type extending BaseEntity
 * @template K - The field key type
 * @returns The type of the field value
 */
export type FieldValue<T extends BaseEntity, K extends EntityFields<T>> = T[K];

/**
 * Type for entity class constructor
 * @template T - The entity type extending BaseEntity
 * @returns A constructor type that creates instances of T
 */
export type EntityClass<T extends BaseEntity> = {
	new (): T;
} & typeof BaseEntity;

/**
 * Type to get only unique fields from an entity
 * @template T - The entity type extending BaseEntity
 * @returns Union type of all string property keys
 */
export type UniqueFields<T extends BaseEntity> = Extract<keyof T, string>;

/**
 * Type for the where clause in findUnique
 * @template T - The entity type extending BaseEntity
 */
export type FindUniqueWhere<T extends BaseEntity> = {
	[K in keyof T]?: T[K];
};

/**
 * Type for the where clause in findMany
 * @template T - The entity type extending BaseEntity
 */
export type FindManyWhere<T extends BaseEntity> = {
	[K in keyof T]?: T[K];
};
