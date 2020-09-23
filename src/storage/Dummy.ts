import { InitStorageOptions, TransactionData } from '../models';
import { Adapter as StorageAdapter, TransactionInstance } from './models';

export class DummyAdapter extends StorageAdapter {
  constructor(storageOptions: InitStorageOptions) {
    super(storageOptions);
  }

  public createTransaction(semanticId: string[], startTime: BigInt): Promise<string> {
    return Promise.resolve('');
  }

  public setTransactionParent(semanticId: string[], syntacticId: string, parentSyntacticId: string): Promise<void> {
    return Promise.resolve();
  }

  public endTransaction(semanticId: string[], syntacticId: string, timing: BigInt): Promise<void> {
    return Promise.resolve();
  }

  public updateTransactionData(syntacticId: string, key: string, value: any): Promise<void>;
  public updateTransactionData(syntacticId: string, transactionData: TransactionData): Promise<void>;
  public updateTransactionData(syntacticId: any, key: any, value?: any) {
    return Promise.resolve();
  }

  public getChildren(semanticId: string[]): Promise<string[][]> {
    return Promise.resolve([[]]);
  }
  public getInstancesTimings(semanticId: string[]): Promise<(number | undefined)[]> {
    return Promise.resolve([]);
  }
  public getInstances(semanticId: string[]): Promise<TransactionInstance[]> {
    return Promise.resolve([]);
  }
  public getTransactionData(syntacticId: string): Promise<TransactionData> {
    return Promise.resolve({});
  }

  public clear(): Promise<void> {
    return Promise.resolve();
  }
}
