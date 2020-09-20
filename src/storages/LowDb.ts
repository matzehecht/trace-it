import * as path from 'path';
import LowDb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { CollectionChain } from 'lodash';
import { nanoid } from 'nanoid';

import { InitStorageOptions, TransactionData } from '../models';
import { Adapter as StorageAdapter } from '../storage';

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
  private db: LowDb.LowdbSync<LowDbDatabase> | undefined;

  constructor({dbUrl = './', dbName = 'perf'}: InitStorageOptions) {
    const adapter = new FileSync(path.join(dbUrl, `${dbName}.json`));
    this.db = LowDb(adapter);
    this.db.defaults({transactions: {}, transactionData: []}).write();
  }

  public createTransaction(semanticId: string[], startTime: BigInt, parentSyntacticId?: string): string {
    const pathToTransaction = semanticId.join('.children.');

    const syntacticId = nanoid();

    // Check if semantic Transaction does exist.
    if (!this.db?.has(`transactions.${pathToTransaction}`).value()) {
      // If not: create semantic Transaction
      this.db?.set(`transactions.${pathToTransaction}`, {children: {}, instances: []}).write();
    }

    (this.db?.get(`transactions.${pathToTransaction}.instances`) as unknown as CollectionChain<LowDbTransactionInstance>).push({syntacticId, parentSyntacticId, startTime: new Date(Number(startTime))}).write();

    this.db?.get('transactionData').push({syntacticId});

    return syntacticId;
  }

  public endTransaction(semanticId: string[], syntacticId: string, timing: BigInt): void {
    const pathToTransaction = semanticId.join('.children.');

    (this.db?.get(`transactions.${pathToTransaction}.instances`) as unknown as CollectionChain<LowDbTransactionInstance>).find({ syntacticId }).assign({ timing: Number(timing) }).write();
  }

  public updateTransactionData(syntacticId: string, x: TransactionData | string, y?: any | undefined): void {
    if (typeof x === 'string') {
      if (typeof y === 'undefined') {
        this.db?.get('transactionData').find({ syntacticId }).unset(x).write();
      } else {
        this.db?.get('transactionData').find({ syntacticId }).assign({[x]: y}).write();
      }
    } else {
      this.db?.get('transactionData').find({ syntacticId }).assign(x).write();
    }
  }
}
