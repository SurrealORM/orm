import { Surreal } from "surrealdb";
import type {
	SurrealORMOptions,
	EntityClass,
	FindUniqueWhere,
	FindManyWhere,
} from "./types";
import { create } from "./methods/create";
import { findUnique, findMany, findAll } from "./methods/find";
import { update } from "./methods/update";
import { delete_ } from "./methods/delete";
import { raw } from "./methods/raw";
import { upsert } from "./methods/upsert";
import type { BaseEntity } from "./entity";

/**
 
 * 
 * // Connect to the database
 * await orm.connect();
 * 
 * // Use the ORM
 * const user = await orm.findUnique(User, 'email', 'user@example.com');
 * ```
 */
export class SurrealORM {
	/** The SurrealDB client instance */
	protected client: Surreal | null;
	/** The connection options */
	public readonly options: SurrealORMOptions;
	public readonly database: string;

	/**
	 * Main SurrealORM class for database operations
	 *
	 * A type-safe ORM for SurrealDB with decorator-based schemas that provides:
	 * - Decorator-based schema definitions
	 * - Type-safe database operations
	 * - Connection management
	 * - CRUD operations (create, findUnique, findMany, findAll, update, delete)
	 * - Raw query execution
	 *
	 * @example
	 * ```typescript
	 * // Create a new ORM instance
	 * const orm = new SurrealORM({
	 *   url: 'http://localhost:8000/rpc',
	 *   namespace: 'test',
	 *   database: 'test',
	 *   username: 'root',
	 *   password: 'root'
	 * });
	 * ```
	 *
	 * @param options - Configuration options for the SurrealDB connection
	 * @param options.url - The URL of the SurrealDB instance (e.g., 'http://localhost:8000/rpc')
	 * @param options.namespace - The namespace to connect to
	 * @param options.database - The database to use within the namespace
	 * @param options.username - Username for authentication (defaults to 'root')
	 * @param options.password - Password for authentication (defaults to 'root')
	 */
	constructor(options: SurrealORMOptions) {
		this.client = new Surreal();
		this.options = options;
		this.database = options.database;
	}

	/**
	 * Connect to the SurrealDB instance
	 * @param type - The type of connection to use: 'namespace', 'database', or 'root'
	 * @throws Error if connection fails
	 * @example
	 * ```typescript
	 * await orm.connect('namespace');
	 * ```
	 */
	async connect(
		type: "namespace" | "database" | "root" = "root",
	): Promise<void> {
		try {
			this.client = new Surreal();
			
			// Ensure the client is connected
			await this.client.connect(this.options.url);
			
			// Handle authentication based on connection type
			switch (type) {
				case "namespace":
					await this.client.signin({
						username: this.options.username || "root",
						password: this.options.password || "root",
						namespace: this.options.namespace,
					});
					break;
				case "database":
					await this.client.signin({
						username: this.options.username || "root",
						password: this.options.password || "root",
						namespace: this.options.namespace,
						database: this.options.database,
					});
					break;
				case "root":
					await this.client.signin({
						username: this.options.username || "root",
						password: this.options.password || "root",
					});
					break;
				default:
					throw new Error("Invalid connection type");
			}
			
			// Make sure client exists before using it
			if (!this.client) {
				throw new Error("SurrealDB client not initialized");
			}

			// Set namespace and database
			await this.client.use({
				namespace: this.options.namespace,
				database: this.options.database,
			});
		} catch (error) {
			this.client = null;
			throw new Error(`Failed to connect to SurrealDB: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	/**
	 * Disconnect from the SurrealDB instance
	 * @throws Error if disconnection fails
	 * @example
	 * ```typescript
	 * await orm.disconnect();
	 * ```
	 */
	async disconnect(): Promise<void> {
		if (this.client) {
			await this.client.close();
			this.client = null;
		}
	}

	/**
	 * Check if connected to SurrealDB
	 * @returns boolean indicating if connected
	 * @example
	 * ```typescript
	 * if (orm.isConnected()) {
	 *   console.log('Connected to SurrealDB');
	 * }
	 * ```
	 */
	async isConnected(): Promise<boolean> {
		try {
			if (!this.client) {
				return false;
			}
			await this.client.ping();
			return true;
		} catch (error) {
			this.client = null;
			return false;
		}
	}

	/**
	 * Create a new record
	 * @param entity - The entity to create
	 * @returns The created entity
	 * @throws Error if not connected to SurrealDB
	 * @example
	 * ```typescript
	 * const user = new User();
	 * user.name = 'John Doe';
	 * user.email = 'john@example.com';
	 * const createdUser = await orm.create(user);
	 * ```
	 */
	create = create.bind(this) as <T extends BaseEntity>(entity: T) => Promise<T>;

	/**
	 * Find a single record by unique field values
	 * @param entityClass - The entity class to find
	 * @param where - The where clause containing unique field values
	 * @returns The found entity or null if not found
	 * @throws Error if not connected to SurrealDB or if fields are not unique
	 */
	findUnique = findUnique.bind(this) as <T extends BaseEntity>(
		entityClass: EntityClass<T>,
		where: FindUniqueWhere<T>
	) => Promise<T | null>;

	/**
	 * Find multiple records by where clause
	 * @param entityClass - The entity class to find
	 * @param where - The where clause to filter records
	 * @returns An array of found entities
	 * @throws Error if not connected to SurrealDB
	 */
	findMany = findMany.bind(this) as <T extends BaseEntity>(
		entityClass: EntityClass<T>,
		where: FindManyWhere<T>
	) => Promise<T[]>;

	/**
	 * Find all records of a given entity class
	 * @param entityClass - The entity class to find
	 * @returns An array of all found entities
	 * @throws Error if not connected to SurrealDB
	 */
	findAll = findAll.bind(this) as <T extends BaseEntity>(
		entityClass: EntityClass<T>
	) => Promise<T[]>;

	/**
	 * Update a record
	 * @param entity - The entity to update
	 * @returns The updated entity
	 * @throws Error if not connected to SurrealDB
	 */
	update = update.bind(this) as <T extends BaseEntity>(
		entity: T
	) => Promise<T>;

	/**
	 * Delete a record
	 * @param entity - The entity to delete
	 * @returns The deleted entity
	 * @throws Error if not connected to SurrealDB
	 */
	delete = delete_.bind(this) as <T extends BaseEntity>(
		entity: T
	) => Promise<T>;

	/**
	 * Execute a raw query
	 * @param query - The query to execute
	 * @param params - Optional parameters for the query
	 * @returns The query result
	 * @throws Error if not connected to SurrealDB
	 */
	async raw<T = any>(query: string, params?: Record<string, any>): Promise<T[]> {
		if (!this.client) {
			throw new Error('Not connected to SurrealDB');
		}
		return await this.client.query(query, params);
	}

	/**
	 * Upsert a record
	 * @param entity - The entity to upsert
	 * @returns The upserted entity
	 * @throws Error if not connected to SurrealDB
	 */
	upsert = upsert.bind(this) as <T extends BaseEntity>(
		entity: T,
		...uniqueFields: (keyof T)[]
	) => Promise<T>;
}