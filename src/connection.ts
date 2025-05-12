import { Surreal } from 'surrealdb';
import { SurrealORMOptions, EntityClass, FindUniqueWhere, FindManyWhere } from './types';
import { create } from './methods/create';
import { findUnique, findMany, findAll } from './methods/find';
import { update } from './methods/update';
import { delete_ } from './methods/delete';
import { raw } from './methods/raw';
import { upsert } from './methods/upsert';
import { BaseEntity } from './entity';

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
  protected client: Surreal | null = null;
  /** The connection options */
  private options: SurrealORMOptions;

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
    this.options = options;
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
  async connect(type: 'namespace' | 'database' | 'root' = 'root'): Promise<void> {
    this.client = new Surreal();
    await this.client.connect(this.options.url);
    switch (type) {
      case 'namespace':
        await this.client.signin({
          username: this.options.username || 'root',
          password: this.options.password || 'root',
          namespace: this.options.namespace,
        });
        break;
      case 'database':
        await this.client.signin({
          username: this.options.username || 'root',
          password: this.options.password || 'root',
          namespace: this.options.namespace,
          database: this.options.database,
        });
        break;
      case 'root':
        await this.client.signin({
          username: this.options.username || 'root',
          password: this.options.password || 'root',
        });
        break;
      default:
        throw new Error('Invalid connection type');
    }
    await this.client.use({
      namespace: this.options.namespace,
      database: this.options.database,
    });
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
  create = create.bind(this);

  /**
   * Find a single record by unique field values
   * @param entityClass - The entity class to find
   * @param where - The where clause containing unique field values
   * @returns The found entity or null if not found
   * @throws Error if not connected to SurrealDB or if fields are not unique
   * @example
   * ```typescript
   * const user = await orm.findUnique(User, { email: 'john@example.com' });
   * if (user) {
   *   console.log('Found user:', user.name);
   * }
   * ```
   */
  findUnique = findUnique.bind(this) as <T extends BaseEntity>(entityClass: EntityClass<T>, where: FindUniqueWhere<T>) => Promise<T | null>;

  /**
   * Find multiple records by field values
   * @param entityClass - The entity class to find
   * @param where - The where clause containing field values
   * @returns Array of found entities
   * @throws Error if not connected to SurrealDB
   * @example
   * ```typescript
   * const users = await orm.findMany(User, { age: 30, role: 'admin' });
   * console.log('Found users:', users.length);
   * ```
   */
  findMany = findMany.bind(this) as <T extends BaseEntity>(entityClass: EntityClass<T>, where: FindManyWhere<T>) => Promise<T[]>;

  /**
   * Find all records of an entity type
   * @param entityClass - The entity class to find
   * @returns Array of all entities
   * @throws Error if not connected to SurrealDB
   * @example
   * ```typescript
   * const allUsers = await orm.findAll(User);
   * console.log('Total users:', allUsers.length);
   * ```
   */
  findAll = findAll.bind(this);

  /**
   * Update an existing record
   * @param entity - The entity to update
   * @returns The updated entity
   * @throws Error if not connected to SurrealDB
   * @example
   * ```typescript
   * const user = await orm.findUnique(User, 'email', 'john@example.com');
   * if (user) {
   *   user.age = 31;
   *   const updatedUser = await orm.update(user);
   * }
   * ```
   */
  update = update.bind(this);

  /**
   * Delete a record
   * @param entity - The entity to delete
   * @throws Error if not connected to SurrealDB
   * @example
   * ```typescript
   * const user = await orm.findUnique(User, 'email', 'john@example.com');
   * if (user) {
   *   await orm.delete(user);
   * }
   * ```
   */
  delete = delete_.bind(this);

  /**
   * Execute a raw query
   * @param query - The query to execute
   * @param params - Optional parameters for the query
   * @returns The query result
   * @throws Error if not connected to SurrealDB
   * @example
   * ```typescript
   * const result = await orm.raw('SELECT * FROM user WHERE age > $age', { age: 30 });
   * ```
   */
  raw = raw.bind(this);

  /**
   * Create or update a record based on unique fields
   * @param entity - The entity to create or update
   * @param uniqueFields - The unique fields to check for existing records
   * @returns The created or updated entity
   * @throws Error if not connected to SurrealDB
   * @example
   * ```typescript
   * const user = new User();
   * user.name = 'John Doe';
   * user.email = 'john@example.com';
   * const result = await orm.upsert(user, 'email');
   * ```
   */
  upsert = upsert.bind(this);
} 