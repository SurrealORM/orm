# 🚀 SurrealORM

<div align="center">
  <img src="https://raw.githubusercontent.com/SurrealORM/orm/refs/heads/main/assets/surrealorm-full_white.png" alt="SurrealORM Logo" width="800"/>
</div>

A TypeScript ORM for SurrealDB with decorators and type safety.

> ⚠️ **DISCLAIMER**: This package is currently in early development and is not yet ready for production use. While it provides basic ORM functionality, it may contain bugs, breaking changes, and missing features. Use at your own risk and feel free to contribute to its development!

## ✨ Features

- 🛡️ Type-safe database operations
- 🏷️ Decorator-based schema definition
- 🔄 Automatic table creation
- 🔍 Query builder
- 📘 TypeScript-first approach

## 📦 Installation

> Not yet published

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
await orm.connect();

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT 