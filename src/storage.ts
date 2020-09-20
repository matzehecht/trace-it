import { InitStorageOptions, TransactionData } from './models';
import { LowDbAdapter } from './storages/LowDb';

export type Drivers = 'memory' | 'lowdb' | 'mongodb';

/**
 * This return the concrete storage adapter if needed.
 *
 * @export
 * @param {Drivers} driver
 * @returns {(Adapter | undefined)} The storage adapter or undefined if no imlpementation needed.
 */
export function getStorage(driver: Drivers, storageOptions: InitStorageOptions): Adapter | undefined {
  switch (driver) {
    case 'memory':
      // Nothing to do here!
      return undefined;
    case 'lowdb':
      return new LowDbAdapter(storageOptions);
    case 'mongodb':
      console.log('Not yet implemented!');
      break;
  }
  return undefined;
}

/**
 * Declaration for the Storage drivers.
 *
 * @export
 * @abstract
 * @class Adapter
 */
export abstract class Adapter {
  constructor(storageOptions: InitStorageOptions) {}

  /**
   * This creates the transaction entry and the transactionData entry in the storage.
   * It returns the syntacticId of the transaction.
   * Rhe semanticId array represent the transaction hierarchy.
   *
   * @abstract
   * @param {string[]} semanticId
   * @param {BigInt} startTime
   * @returns {Promise<string>}
   * @memberof Adapter
   */
  public abstract createTransaction(semanticId: string[], startTime: BigInt, parentSyntacticId?: string): string;

  /**
   * This will insert the timing in the transaction identified by it's syntacticId
   *
   * @abstract
   * @param {string} syntacticId
   * @param {BigInt} timing
   * @returns {Promise<void>}
   * @memberof Adapter
   */
  public abstract endTransaction(semanticId: string[], syntacticId: string, timing: BigInt): void;

  /**
   * This will update the transactionData identified by it the syntacticId of the related transaction.
   * It will remove the key when the value is undefined, add new keys and replace keys when already existing.
   *
   * @abstract
   * @param {string} syntacticId
   * @param {string} key
   * @param {string} value
   * @returns {Promise<void>}
   * @memberof Adapter
   */
  public abstract updateTransactionData(syntacticId: string, key: string, value: any | undefined): void;

  /**
   * This will update the transactionData identified by it the syntacticId of the related transaction.
   * It will add new keys and replace keys where already existing.
   *
   * @abstract
   * @param {string} syntacticId
   * @param {TransactionData} transactionData
   * @returns {Promise<void>}
   * @memberof Adapter
   */
  public abstract updateTransactionData(syntacticId: string, transactionData: TransactionData): void;
}
