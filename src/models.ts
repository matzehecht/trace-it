import { Drivers as StorageDrivers } from './storage';

export type TransactionData = { [key: string]: any };

/**
 * Describes the options used for the initialization.
 *
 * @export
 * @interface InitOptions
 */
export interface InitOptions {
  /**
   * Specifies the Strage that should be used.
   *
   * @type {StorageDrivers}
   * @memberof InitOptions
   */
  storage?: StorageDrivers;
  /**
   * The configuration to connect to the storage.
   *
   * @type {InitStorageOptions}
   * @memberof InitOptions
   */
  storageOptions?: InitStorageOptions;
}

export interface InitStorageOptions {
  /**
   * Name of the database (or the db file for lowdb: `dbName: 'perf'` will be 'perf.json').
   * Not used for memory.
   *
   * @type {string}
   * @memberof InitDbOptions
   */
  dbName?: string;
  /**
   * The database url (or directory path for lowdb).
   * Not used for memory.
   *
   * @type {string}
   * @memberof InitDbOptions
   */
  dbUrl?: string;
  /**
   * The db user (if needed).
   *
   * @type {string}
   * @memberof InitDbOptions
   */
  dbUser?: string;
  /**
   * The db password (if needed).
   *
   * @type {string}
   * @memberof InitDbOptions
   */
  dbPassword?: string;
}

/**
 * Specifies the precision used for the output.
 *
 * @export
 * @enum {number}
 */
export enum PRECISION {
  NS = 'ns',
  MS = 'ms',
  S = 's'
}
