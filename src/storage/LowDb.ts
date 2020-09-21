import LowDb from 'lowdb';
import FileAsync from 'lowdb/adapters/FileAsync';
import { CollectionChain } from 'lodash';
import { nanoid } from 'nanoid';

import { InitStorageOptions, TransactionData } from '../models';
import { Adapter as StorageAdapter, TransactionInstance } from './models';

interface LowDbDatabase {
  transactions: LowDbTransactionCollection;
  transactionData: LowDbTransactionData[];
}

interface LowDbTransactionCollection {
  [semanticId: string]: LowDbTransaction;
}

interface LowDbTransaction {
  children: LowDbTransactionCollection;
  instances: LowDbTransactionInstance[];
}

interface LowDbTransactionInstance {
  syntacticId: string;
  parentSyntacticId?: string;
  startTime: Date;
  timing?: number;
}

interface LowDbTransactionData extends TransactionData {
  syntacticId: string;
}

export class LowDbAdapter implements StorageAdapter {
  private db: Promise<LowDb.LowdbAsync<LowDbDatabase>>;

  constructor({ dbName = './perf.json' }: InitStorageOptions) {
    const adapter = new FileAsync(dbName);

    this.db = LowDb(adapter);
    this.db.then((db) => db.defaults({ transactions: {}, transactionData: [] }).write());
  }

  public async createTransaction(semanticId: string[], startTime: BigInt): Promise<string> {
    const pathToTransaction = semanticId.join('.children.');

    const syntacticId = nanoid();

    // Check if semantic Transaction does exist.
    if (!(await this.db).has(`transactions.${pathToTransaction}`).value()) {
      // If not: create semantic Transaction
      (await this.db).set(`transactions.${pathToTransaction}`, { children: {}, instances: [] }).write();
    }

    (((await this.db).get(`transactions.${pathToTransaction}.instances`) as unknown) as CollectionChain<LowDbTransactionInstance>)
      .push({ syntacticId, startTime: new Date(Number(startTime)) })
      .write();

    (await this.db).get('transactionData').push({ syntacticId }).write();

    return syntacticId;
  }

  public async setTransactionParent(semanticId: string[], syntacticId: string, parentSyntacticId: string): Promise<void> {
    const pathToTransaction = semanticId.join('.children.');

    (((await this.db).get(`transactions.${pathToTransaction}.instances`) as unknown) as CollectionChain<LowDbTransactionInstance>)
      .find({ syntacticId })
      .assign({ parentSyntacticId })
      .write();
  }

  public async endTransaction(semanticId: string[], syntacticId: string, timing: BigInt): Promise<void> {
    const pathToTransaction = semanticId.join('.children.');

    (((await this.db).get(`transactions.${pathToTransaction}.instances`) as unknown) as CollectionChain<LowDbTransactionInstance>)
      .find({ syntacticId })
      .assign({ timing: Number(timing) })
      .write();
  }

  public async updateTransactionData(syntacticId: string, x: TransactionData | string, y?: any | undefined): Promise<void> {
    if (typeof x === 'string') {
      if (typeof y === 'undefined') {
        (await this.db).get('transactionData').find({ syntacticId }).unset(x).write();
      } else {
        (await this.db)
          .get('transactionData')
          .find({ syntacticId })
          .assign({ [x]: y })
          .write();
      }
    } else {
      (await this.db).get('transactionData').find({ syntacticId }).assign(x).write();
    }
  }

  public async getChildren(semanticId: string[]): Promise<string[][]> {
    const pathToTransaction = semanticId.length === 0 ? '' : `.${semanticId.join('.children.')}.children`;

    return (await this.db)
      .get(`transactions${pathToTransaction}`)
      .keys()
      .value()
      .map((id) => [...semanticId, id]);
  }

  public async getInstancesTimings(semanticId: string[]): Promise<(number | undefined)[]> {
    const pathToTransaction = semanticId.join('.children.');

    return (((await this.db).get(`transactions.${pathToTransaction}.instances`) as unknown) as CollectionChain<LowDbTransactionInstance>)
      .map('timing').value();
  }

  public async getInstances(semanticId: string[]): Promise<TransactionInstance[]> {
    const pathToTransaction = semanticId.join('.children.');

    return (((await this.db).get(`transactions.${pathToTransaction}.instances`) as unknown) as CollectionChain<LowDbTransactionInstance>)
      .value();
  }

  public async getTransactionData(syntacticId: string): Promise<TransactionData> {
    return (await this.db).get('transactionData').find( { syntacticId }).value();
  }
}
