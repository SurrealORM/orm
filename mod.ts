// Core exports
export { SurrealORM } from "./src/connection";
export { BaseEntity } from "./src/entity";
export { Entity, Property } from "./src/decorators";

// Method exports
export { create } from "./src/methods/create";
export { findUnique, findMany, findAll } from "./src/methods/find";
export { update } from "./src/methods/update";
export { delete_ as delete } from "./src/methods/delete";
export { raw } from "./src/methods/raw";
export { upsert } from "./src/methods/upsert";

// Type exports
export type {
	SurrealORMOptions,
	SurrealRecord,
	EntityFields,
	FieldValue,
	EntityClass,
	UniqueFields,
	FindUniqueWhere,
	FindManyWhere,
} from "./src/types";
