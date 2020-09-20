import { InitOptions, PRECISION, TransactionData } from './models';
import * as Storage from './storage';

export { PRECISION } from './models';

let StorageAdapter: Storage.Adapter = Storage.getStorage('memory', {});

export function init({ storage = 'memory', storageOptions = {} }: InitOptions = { storage: 'memory', storageOptions: {} }) {
  StorageAdapter = Storage.getStorage(storage, storageOptions);
}

export class Transaction {
  private children: Transaction[] | undefined;
  private endCb: ((result: Result) => void) | undefined;
  private parentSemanticId: string[];
  private semanticId: string;
  private syntacticId: Promise<string>;
  private transactionData: TransactionData = {};

  private result: Result | undefined;

  private startTime: bigint;

  private constructor(semanticId: string, parentSemanticId: string[] = []) {
    this.parentSemanticId = parentSemanticId;
    this.semanticId = semanticId;
    this.startTime = process.hrtime.bigint();
    this.syntacticId = StorageAdapter.createTransaction([...parentSemanticId, semanticId], this.startTime);
  }

  public startChild(semanticId: string): Transaction {
    const child = new Transaction(semanticId, this.parentSemanticId.concat(this.semanticId));

    this.syntacticId.then(id => {
      child.setParentSyntacticId(id);
    });

    if (!this.children) this.children = [];
    this.children.push(child);
    return child;
  }

  protected async setParentSyntacticId(parentSyntacticId: string) {
    await StorageAdapter.setTransactionParent([...this.parentSemanticId, this.semanticId], await this.syntacticId, parentSyntacticId);
  }

  protected onEnd(cb: (result: Result) => void): void {
    if (this.result) {
      return cb(this.result);
    }
    this.endCb = cb;
  }

  public async set(data: TransactionData): Promise<void>;
  public async set(key: string, data: any | undefined): Promise<void>;
  public async set(x: string | TransactionData, y?: any | undefined): Promise<void> {
    if (typeof x === 'string') {
      if (typeof y === 'undefined') {
        delete this.transactionData[x];
      } else {
        this.transactionData[x] = y;
      }
      StorageAdapter.updateTransactionData(await this.syntacticId, x, y);
    } else {
      this.transactionData = { ...this.transactionData, ...x };
      StorageAdapter.updateTransactionData(await this.syntacticId, x);
    }
  }

  public getResult(): Result | undefined {
    return this.result;
  }

  public async end(): Promise<Result> {
    const proms = this.children?.map((child) => {
      return new Promise<Result>((resolve) => {
        child.onEnd(resolve);
      });
    });

    const childrenResults = proms && (await Promise.all(proms));
    const timing = process.hrtime.bigint() - this.startTime;

    const result = Result.fromObject({
      semanticId: this.semanticId,
      timing,
      children: childrenResults
    });

    this.result = result;
    this.endCb?.(result);

    this.syntacticId.then((id) => {
      StorageAdapter.endTransaction([...this.parentSemanticId, this.semanticId], id, timing);
    });

    return result;
  }

  static startTransaction(semanticId: string) {
    return new Transaction(semanticId);
  }
}

export class Result {
  readonly semanticId: string;
  readonly timing: BigInt;
  readonly children?: Result[] | undefined;

  private constructor(semanticId: string, timing: BigInt, children?: Result[]) {
    this.semanticId = semanticId;
    this.timing = timing;
    this.children = children;
  }

  public toString(prec: PRECISION): string {
    const output = this.children
      ?.map((child) => {
        const childResult = `| - ${child.toString(prec)}`;
        return childResult.replace(/\n/g, `\n|   `);
      })
      .join('\n|\n');
    const outTiming: number = prec === 'ns' ? Number(this.timing) : prec === 'ms' ? Number(this.timing) / 1000000 : Number(this.timing) / 1000000000;
    return `${this.semanticId} - ${Math.round(outTiming)}${prec}${output ? `\n${output}` : ''}`;
  }

  static fromObject(obj: { semanticId: string; timing: BigInt; children?: Result[] }) {
    return new Result(obj.semanticId, obj.timing, obj.children);
  }
}
