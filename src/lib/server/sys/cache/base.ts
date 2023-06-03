/**
 * Abstract class representing an asynchronous cache.
 */
export abstract class BaseCache {
	abstract match(key: string): Promise<Response | undefined>;
	abstract put(key: string, response: Response): Promise<void>;
	abstract delete(key: string): Promise<void>;
}
