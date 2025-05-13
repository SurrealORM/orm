import "reflect-metadata";

/**
 * Get metadata for a target
 * @param key - The metadata key
 * @param target - The target object
 * @param propertyKey - Optional property key
 * @returns The metadata value
 */
export function getMetadata(
	key: any,
	target: any,
	propertyKey?: string | symbol,
): any {
	return Reflect.getMetadata(key, target, propertyKey);
}

/**
 * Define metadata for a target
 * @param key - The metadata key
 * @param value - The metadata value
 * @param target - The target object
 * @param propertyKey - Optional property key
 */
export function defineMetadata(
	key: any,
	value: any,
	target: any,
	propertyKey?: string | symbol,
): void {
	Reflect.defineMetadata(key, value, target, propertyKey);
}
