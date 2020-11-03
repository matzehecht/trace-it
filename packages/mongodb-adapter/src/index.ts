import { MongoClient, MongoClientOptions } from 'mongodb';
import { nanoid } from 'nanoid';

import { InitStorageOptions, TransactionData, TransactionInstance, Adapter } from '@trace-it/types';

interface DbTransactionInstance {
  _id: string;
  semanticId: string;
  startTime: Date;
  parentSyntacticId?: string;
  timing?: number;
}

interface DbTransactionData {
  _id: string;
  [x: string]: any;
}

const CLIENT_OPTIONS: MongoClientOptions = { useNewUrlParser: true, useUnifiedTopology: true, poolSize: 1 };

export class MongoDbAdapter implements Adapter {
  private connectionString: string;

  constructor({ dbName = 'perfDB', dbUrl = 'mongodb://localhost:27017', dbUser, dbPassword }: InitStorageOptions) {
    this.connectionString = `${dbUrl.split('://')[0]}://${dbUser && dbPassword ? `${dbUser}:${dbPassword}@` : ''}${dbUrl.split('://')[1]}/${dbName}`;
  }

  private getClient(): Promise<MongoClient> {
    return MongoClient.connect(this.connectionString, CLIENT_OPTIONS);
  }

  public async createTransaction(semanticId: string[], startTime: BigInt): Promise<string> {
    const client = this.getClient();
    const db = (await client).db();
    const pathToTransaction = semanticId.join('.');

    const syntacticId = nanoid();

    await db
      .collection<DbTransactionInstance>('transactions.instances')
      .insertOne({ _id: syntacticId, semanticId: pathToTransaction, startTime: new Date(Number(startTime)) });
    await db.collection<DbTransactionData>('transactions.data').insertOne({ _id: syntacticId });

    db.collection<DbTransactionInstance>('transactions.instances')
      .indexExists('semanticId')
      .then(async (result) =>
        result
          ? (await client).close()
          : db
              .collection<DbTransactionInstance>('transactions.instances')
              .createIndex('semanticId')
              .then(async () => (await client).close())
      );

    return syntacticId;
  }

  public async setTransactionParent(semanticId: string[], syntacticId: string, parentSyntacticId: string): Promise<void> {
    const client = this.getClient();
    const db = (await client).db();
    await db.collection<DbTransactionInstance>('transactions.instances').findOneAndUpdate({ _id: syntacticId }, { $set: { parentSyntacticId } });
    (await client).close();
  }

  public async endTransaction(semanticId: string[], syntacticId: string, timing: BigInt): Promise<void> {
    const client = this.getClient();
    const db = (await client).db();
    await db.collection<DbTransactionInstance>('transactions.instances').findOneAndUpdate({ _id: syntacticId }, { $set: { timing: Number(timing) } });
    (await client).close();
  }

  public async updateTransactionData(syntacticId: string, x: TransactionData | string, y?: any | undefined): Promise<void> {
    const client = this.getClient();
    const db = (await client).db();
    if (typeof x === 'string') {
      if (typeof y === 'undefined') {
        await db.collection<DbTransactionData>('transactions.data').findOneAndUpdate({ _id: syntacticId }, { $unset: { [x]: '' } });
      } else {
        await db.collection<DbTransactionData>('transactions.data').findOneAndUpdate({ _id: syntacticId }, { $set: { [x]: y } });
      }
    } else {
      await db.collection<DbTransactionData>('transactions.data').findOneAndUpdate({ _id: syntacticId }, { $set: x });
    }
    (await client).close();
  }

  public async getChildren(semanticId: string[]): Promise<string[][]> {
    const client = this.getClient();
    const db = (await client).db();
    const pathToTransaction = semanticId.join('.');

    const ids = db
      .collection<DbTransactionInstance>('transactions.instances')
      .find({ semanticId: RegExp(`^${pathToTransaction}.[^.]+$`) }, { projection: { semanticId: true } })
      .toArray();

    const children = (await ids).map(({ semanticId }) => semanticId.split('.'));

    (await client).close();
    return children;
  }

  public async getInstancesTimings(semanticId: string[]): Promise<(number | undefined)[]> {
    const client = this.getClient();
    const db = (await client).db();
    const pathToTransaction = semanticId.join('.');

    const timings = (
      await db
        .collection<DbTransactionInstance>('transactions.instances')
        .find({ semanticId: pathToTransaction }, { projection: { timing: true } })
        .toArray()
    ).map(({ timing }) => timing);

    (await client).close();
    return timings;
  }

  public async getInstances(semanticId: string[]): Promise<TransactionInstance[]> {
    const client = this.getClient();
    const db = (await client).db();
    const pathToTransaction = semanticId.join('.');

    const instances = (await db.collection<DbTransactionInstance>('transactions.instances').find({ semanticId: pathToTransaction }).toArray()).map((doc) => ({
      syntacticId: doc._id,
      parentSyntacticId: doc.parentSyntacticId,
      startTime: doc.startTime,
      timing: doc.timing
    }));

    (await client).close();
    return instances;
  }

  public async getTransactionData(syntacticId: string): Promise<TransactionData> {
    const client = this.getClient();
    const db = (await client).db();
    const transactionData = await db.collection<DbTransactionData>('transactions.data').findOne({ _id: syntacticId }, { projection: { _id: false } });
    (await client).close();
    return transactionData ?? Promise.reject();
  }

  public async clear(): Promise<void> {
    const client = this.getClient();
    const db = (await client).db();
    const proms = [db.dropCollection('transactions.data'), db.dropCollection('transactions.instances')];
    await Promise.all(proms);
    (await client).close();
  }
}
