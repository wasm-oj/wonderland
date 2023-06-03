/**
 * Abstract class representing an asynchronous key-value store.
 */
export abstract class BaseKV {
	/**
	 * Retrieves the value associated with the given key.
	 * @param key The key to retrieve the value for.
	 * @returns A Promise that resolves to the value if found, or null if the key does not exist.
	 */
	abstract get(key: string): Promise<string | null>;

	/**
	 * Sets the value associated with the given key.
	 * @param key The key to set the value for.
	 * @param value The value to set.
	 * @param ttl The time-to-live for the value in seconds, or undefined for no expiration.
	 * @returns A Promise that resolves once the value has been set.
	 */
	abstract set(key: string, value: string, ttl: number | undefined): Promise<void>;

	/**
	 * Deletes the value associated with the given key.
	 * @param key The key to delete.
	 * @returns A Promise that resolves once the value has been deleted.
	 */
	abstract del(key: string): Promise<void>;

	/**
	 * Lists all the keys that start with the given prefix or all keys if no prefix is given.
	 * @param prefix The prefix to match the keys against.
	 * @returns A Promise that resolves to an array of keys matching the prefix.
	 */
	abstract list(prefix: string | undefined): Promise<string[]>;
}
