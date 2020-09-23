import { InitStorageOptions } from '../models';
import { DummyAdapter } from './Dummy';
import { LowDbAdapter } from './LowDb';
import { Adapter, Drivers } from './models';
export { Adapter, Drivers };

/**
 * This return the concrete storage adapter if needed.
 *
 * @export
 * @param {Drivers} driver
 * @returns {(Adapter | undefined)} The storage adapter or undefined if no imlpementation needed.
 */
export function getStorage(driver: Drivers, storageOptions: InitStorageOptions): Adapter {
  switch (driver) {
    case 'memory':
      return new DummyAdapter(storageOptions);
    case 'lowdb':
      return new LowDbAdapter(storageOptions);
    case 'mongodb':
      console.log('Not yet implemented!');
      break;
  }
  return new DummyAdapter(storageOptions);
}

export async function clear(storage: Drivers, storageOptions: InitStorageOptions) {
  const StorageAdapter: Adapter = getStorage(storage, storageOptions);

  await StorageAdapter.clear();
}
