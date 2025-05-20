# SurrealORM Tests

This directory contains tests for the SurrealORM library. All tests use a real SurrealDB instance.

## Prerequisites

Before running tests, make sure you have a SurrealDB instance running. By default, tests will connect to `http://localhost:8000/rpc`.

### Starting SurrealDB

You can start SurrealDB in several ways:

1. **Using Docker**:
```bash
docker run --rm -p 8000:8000 surrealdb/surrealdb:latest start --user root --pass root memory
```

2. **Using npm scripts**:
```bash
# Default (cross-platform)
npm run test:db:start

# Windows-specific
npm run test:db:start:win

# Unix/macOS
npm run test:db:start:unix
```

These scripts ensure the database is running with the correct configuration:
- Memory mode for clean state
- Root user access
- Trace-level logging for debugging
- Default port (8000)

## Directory Structure

- `unit/`: Unit tests for individual components
  - `entity.test.ts`: Tests for entity decorators and base entity functionality
  - `mod.test.ts`: Tests for module exports and initialization
  - `methods/`: Tests for individual ORM methods (create, find, update, etc.)
- `integration/`: Integration tests that test complete workflows
  - `crud.test.ts`: Tests for complete CRUD operations
  - `relations.test.ts`: Tests for entity relationships
  - `transactions.test.ts`: Tests for transaction support
- `setup.ts`: Database connection setup for tests
  - Configures test database connection
  - Provides testORM instance for all tests
  - Handles cleanup between tests
- `test-helpers.ts`: Helper utilities and test entities
  - Test entity definitions
  - Common test utilities
  - Mock data generators
- `globalSetup.ts`: Global test setup
  - Runs before all tests
  - Ensures database is ready
  - Sets up test environment

## Running Tests

### Default

```bash
npm test
```

### Windows (with custom SurrealDB URL)

Use the provided batch file that sets the necessary environment variables:

```bash
.\run-tests.bat
```

Or run the following PowerShell command:

```powershell
$env:SURREAL_URL="http://localhost:8000/rpc"; $env:SURREAL_NAMESPACE="test"; $env:SURREAL_DATABASE="test"; npm test
```

### Unix/macOS (with custom SurrealDB URL)

```bash
SURREAL_URL=http://localhost:8000/rpc SURREAL_NAMESPACE=test SURREAL_DATABASE=test npm test
```

## Configuration

Tests use the following environment variables to connect to SurrealDB:

- `SURREAL_URL` (default: http://localhost:8000/rpc)
- `SURREAL_NAMESPACE` (default: test)
- `SURREAL_DATABASE` (default: test)
- `SURREAL_USERNAME` (default: root)
- `SURREAL_PASSWORD` (default: root)

## Test Database

Tests run against a real SurrealDB instance. Before each test, the relevant tables are cleaned to ensure a consistent test environment.

## Writing New Tests

### Unit Tests

Add new unit tests in the `unit/` directory. These tests will:
- Connect to a real database
- Clean database tables before tests
- Test individual components or functions

```typescript
import { testORM } from '../setup';

describe('My Test Suite', () => {
  beforeEach(async () => {
    // Clear data before each test
    await testORM.raw('DELETE FROM my_table');
  });
  
  it('should do something', async () => {
    // Test code here using testORM
  });
});
```

### Integration Tests

Add integration tests in the `integration/` directory. These tests focus on complete workflows and interactions between components.

## Test Database Scripts

The package includes several scripts to help start the test database:

- `test:db:start`: Starts SurrealDB with default settings (memory mode)
- `test:db:start:win`: Windows-specific script to start the test database
- `test:db:start:unix`: Unix/macOS script to start the test database

These scripts ensure the database is running with the correct configuration for testing:
- Memory mode for clean state
- Root user access
- Trace-level logging for debugging
- Default port (8000)

## Common Issues

- **Connection Issues**: Make sure SurrealDB is running and accessible
- **Permission Errors**: Ensure you're using root credentials
- **Table Not Found**: Tables are cleaned before tests, so make sure your test creates necessary tables
- **Environment Variables**: Double-check that all required environment variables are set correctly 