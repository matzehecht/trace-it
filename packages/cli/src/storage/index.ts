import { Adapter } from '@trace-it/types';

export async function clear(storage: Adapter) {
  await storage.clear();
}
