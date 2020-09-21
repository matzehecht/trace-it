import { InitStorageOptions, TransactionData } from '../models';

export type Drivers = 'memory' | 'lowdb' | 'mongodb';

export interface TransactionInstance {
  syntacticId: string;
  parentSyntacticId?: string;
  startTime: Date;
  timing?: number;
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
   * The semanticId array represent the transaction hierarchy.
   *
   * @abstract
   * @param {string[]} semanticId
   * @param {BigInt} startTime
   * @returns {Promise<string>}
   * @memberof Adapter
   */
  public abstract async createTransaction(semanticId: string[], startTime: BigInt): Promise<string>;

  /**
   * This will set the parent (with parentSyntacticId) of a transaction identified by the semanticId + syntacticId.
   *
   * @abstract
   * @param {string[]} semanticId
   * @param {string} syntacticId
   * @param {string} parentSyntacticId
   * @returns {Promise<void>}
   * @memberof Adapter
   */
  public abstract async setTransactionParent(semanticId: string[], syntacticId: string, parentSyntacticId: string): Promise<void>;

  /**
   * This will insert the timing in the transaction identified by the semanticId + syntacticId.
   *
   * @abstract
   * @param {string} syntacticId
   * @param {BigInt} timing
   * @returns {Promise<void>}
   * @memberof Adapter
   */
  public abstract async endTransaction(semanticId: string[], syntacticId: string, timing: BigInt): Promise<void>;

  /**
   * This will update the transactionData identified by the syntacticId.
   * It will remove the key when the value is undefined, add new keys and replace keys when already existing.
   *
   * @abstract
   * @param {string} syntacticId
   * @param {string} key
   * @param {string} value
   * @returns {Promise<void>}
   * @memberof Adapter
   */
  public abstract async updateTransactionData(syntacticId: string, key: string, value: any | undefined): Promise<void>;

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
  public abstract async updateTransactionData(syntacticId: string, transactionData: TransactionData): Promise<void>;

  public abstract async getChildren(semanticId: string[]): Promise<string[][]>;

  public abstract async getInstancesTimings(semanticId: string[]): Promise<(number | undefined)[]>;

  public abstract async getInstances(semanticId: string[]): Promise<TransactionInstance[]>;

  public abstract async getTransactionData(syntacticId: string): Promise<TransactionData>;
}
