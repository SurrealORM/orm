# 🚀 SurrealORM

<div align="center">
  <img src="https://raw.githubusercontent.com/SurrealORM/orm/refs/heads/main/assets/surrealorm_full_white.png" alt="SurrealORM Logo" width="800"/>
</div>

A TypeScript ORM for SurrealDB with decorators and type safety.

> ⚠️ **DISCLAIMER**: This package is currently in early development and is not yet ready for production use. While it provides basic ORM functionality, it may contain bugs, breaking changes, and missing features. Use at your own risk and feel free to contribute to its development!

## ✨ Features

- 🛡️ Type-safe database operations
- 🏷️ Decorator-based schema definition
- 🔄 Automatic table creation
  > Eventually, when the CLI with migrations will come
- 🔍 Query builder
- 📘 TypeScript-first approach

## 📦 Installation

### Node.js
```bash
npm install @surrealorm/orm
```

### Bun
```bash
bun add @surrealorm/orm
```

### Deno
```bash
deno add jsr:@surrealorm/orm
```

## 🚀 Quick Start

```typescript
import { Entity, BaseEntity, Property, SurrealORM } from 'surrealorm';

// Define your entity
@Entity()
class User extends BaseEntity {
  @Property({ unique: true })
  email!: string;

  @Property()
  name!: string;

  @Property()
  age!: number;
}

// Connect to SurrealDB
const orm = new SurrealORM({
  url: 'http://localhost:8000',
  namespace: 'test',
  database: 'test',
  username: 'root',
  password: 'root'
});

// Specify the type of connection or leave blank for root user
await orm.connect("namespace");

// Create a new user
const user = new User();
user.email = 'john@example.com';
user.name = 'John Doe';
user.age = 30;
await orm.create(user);

// Find a user by unique field
const foundUser = await orm.findUnique(User, {
  email: 'john@example.com'
});

// Find a user by ID
const userById = await orm.findUnique(User, {
  id: 'user:123' // or a RecordId object
});

// Find multiple users
const users = await orm.findMany(User, {
  age: 30
});

// Find all users
const allUsers = await orm.findAll(User);

// Update a user
if (foundUser) {
  foundUser.age = 31;
  await orm.update(foundUser);
}

// Delete a user
if (foundUser) {
  await orm.delete(foundUser);
}

// Disconnect
await orm.disconnect();
```

## 📝 Entity Definition

Use decorators to define your entities:

```typescript
import { Entity, BaseEntity, Property } from 'surrealorm';

@Entity()
class User extends BaseEntity {
  @Property({ unique: true })
  email!: string;

  @Property()
  name!: string;

  @Property()
  age!: number;
}
```

## 🔍 Find Operations

### Find Unique

Find a single record by unique fields or ID:

```typescript
// Find by unique field
const user = await orm.findUnique(User, {
  email: 'john@example.com' // email must be marked as unique
});

// Find by ID
const user = await orm.findUnique(User, {
  id: 'user:123' // or a RecordId object
});
```

### Find Many

Find multiple records by any fields:

```typescript
// Find by any field
const users = await orm.findMany(User, {
  age: 30
});

// Find by multiple fields
const users = await orm.findMany(User, {
  age: 30,
  name: 'John'
});
```

### Find All

Find all records of an entity type:

```typescript
const allUsers = await orm.findAll(User);
```

## 🏷️ Property Decorators

- `@Property()` - Basic property
- `@Property({ unique: true })` - Unique property
- `@Property({ required: true })` - Required property
- `@Property({ type: 'string' })` - Type specification

## 🧪 Testing

To run the tests for SurrealORM, you'll need a running SurrealDB instance with proper permissions.

### Testing Requirements

1. **SurrealDB Server**: Make sure you have a SurrealDB server running (default: http://localhost:8000)
2. **Root Access**: The tests require root access to create tables and define schemas
3. **Environment Setup**: You can configure the database connection using environment variables:
   - `SURREAL_URL` - Database URL (default: http://localhost:8000/rpc)
   - `SURREAL_NAMESPACE` - Namespace for testing (default: test)
   - `SURREAL_DATABASE` - Database name for testing (default: test)
   - `SURREAL_USERNAME` - Username (default: root)
   - `SURREAL_PASSWORD` - Password (default: root)

### Running Tests

```bash
# Start SurrealDB (if not already running)
# Using npm script
npm run test:db:start

# Or using platform-specific scripts
npm run test:db:start:win  # Windows
npm run test:db:start:unix # Unix/macOS

# Run tests
npm test

# Run specific test file
npm test -- test/unit/entity.test.ts
```

### Test Database Scripts

The package includes several scripts to help start the test database:

- `test:db:start`: Starts SurrealDB with default settings (memory mode)
- `test:db:start:win`: Windows-specific script to start the test database
- `test:db:start:unix`: Unix/macOS script to start the test database

These scripts ensure the database is running with the correct configuration for testing:
- Memory mode for clean state
- Root user access
- Trace-level logging for debugging
- Default port (8000)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT 