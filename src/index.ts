import { PRECISION, TransactionData, Adapter } from '@trace-it/types';

let StorageAdapter: Adapter | undefined;

/**
 * Initializes trace-it.
 *
 * @export
 * @param {InitOptions} [{ storage = 'memory', storageOptions = {} }={ storage: 'memory', storageOptions: {} }]
 */
export function init(storage?: Adapter) {
  StorageAdapter = storage;
}

/**
 * A single Transaction that will be tracked. Transaction starts immediatly.
 *
 * @export
 * @class Transaction
 */
export class Transaction {
  private children: Transaction[] | undefined;
  private endCb: ((result: Result) => void) | undefined;
  private parentSemanticId: string[];
  private semanticId: string;
  private syntacticId: Promise<string> | undefined;
  private transactionData: TransactionData = {};

  private result: Result | undefined;

  private startTime: bigint;

  /**
   * Creates an instance of Transaction.
   * @param {string} semanticId
   * @param {string[]} [parentSemanticId=[]]
   * @memberof Transaction
   */
  private constructor(semanticId: string, parentSemanticId: string[] = []) {
    this.parentSemanticId = parentSemanticId;
    this.semanticId = semanticId;
    this.startTime = process.hrtime.bigint();
    this.syntacticId = StorageAdapter?.createTransaction([...parentSemanticId, semanticId], this.startTime);
  }

  /**
   * STarts a new child of the transaction.
   *
   * @param {string} semanticId
   * @returns {Transaction}
   * @memberof Transaction
   */
  public startChild(semanticId: string): Transaction {
    const child = new Transaction(semanticId, this.parentSemanticId.concat(this.semanticId));

    this.syntacticId?.then(id => {
      child.setParentSyntacticId(id);
    });

    if (!this.children) this.children = [];
    this.children.push(child);
    return child;
  }

  /**
   * Sets the parent syntactic Id of a transaction.
   *
   * @protected
   * @param {string} parentSyntacticId
   * @returns {Promise<void>}
   * @memberof Transaction
   */
  protected async setParentSyntacticId(parentSyntacticId: string): Promise<void> {
    await StorageAdapter?.setTransactionParent([...this.parentSemanticId, this.semanticId], await this.syntacticId!, parentSyntacticId);
  }

  /**
   * Register a new callback that will be called on end.
   *
   * @protected
   * @param {(result: Result) => void} cb
   * @returns {void}
   * @memberof Transaction
   */
  protected onEnd(cb: (result: Result) => void): void {
    if (this.result) {
      return cb(this.result);
    }
    this.endCb = cb;
  }

  /**
   * Sets the transaction data of the transaction.
   *
   * @param {TransactionData} data
   * @returns {Promise<void>}
   * @memberof Transaction
   */
  public async set(data: TransactionData): Promise<void>;

  /**
   * Sets or removes the transaction data of the transaction.
   *
   * @param {string} key
   * @param {(any | undefined)} data
   * @returns {Promise<void>}
   * @memberof Transaction
   */
  public async set(key: string, data: any | undefined): Promise<void>;
  public async set(x: string | TransactionData, y?: any | undefined): Promise<void> {
    if (typeof x === 'string') {
      if (typeof y === 'undefined') {
        delete this.transactionData[x];
      } else {
        this.transactionData[x] = y;
      }
      StorageAdapter?.updateTransactionData(await this.syntacticId!, x, y);
    } else {
      this.transactionData = { ...this.transactionData, ...x };
      StorageAdapter?.updateTransactionData(await this.syntacticId!, x);
    }
  }

  /**
   * Returns the result of the transaction and it's children.
   *
   * @returns {(Result | undefined)}
   * @memberof Transaction
   */
  public getResult(): Result | undefined {
    return this.result;
  }

  /**
   * Triggers the end of the transaction and waits until all children have been ended.
   * Returns the result.
   *
   * @returns {Promise<Result>}
   * @memberof Transaction
   */
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

    this.syntacticId?.then((id) => {
      StorageAdapter?.endTransaction([...this.parentSemanticId, this.semanticId], id, timing);
    });

    return result;
  }

  /**
   * Starts a new Transaction.
   *
   * @static
   * @param {string} semanticId
   * @returns {Transaction}
   * @memberof Transaction
   */
  static startTransaction(semanticId: string): Transaction {
    return new Transaction(semanticId);
  }
}

/**
 * Start a new Transaction.
 * *Alias for Transaction.startTransaction()*
 *
 * @export
 * @param {string} semanticId
 * @returns {Transaction}
 */
export function startTransaction(semanticId: string): Transaction {
  return Transaction.startTransaction(semanticId);
}

/**
 * The result of a transation and it's children.
 *
 * @export
 * @class Result
 */
export class Result {
  readonly semanticId: string;
  readonly timing: BigInt;
  readonly children?: Result[] | undefined;

  private constructor(semanticId: string, timing: BigInt, children?: Result[]) {
    this.semanticId = semanticId;
    this.timing = timing;
    this.children = children;
  }

  /**
   * Serializes the result.
   *
   * @param {PRECISION} prec
   * @returns {string}
   * @memberof Result
   */
  public toString(prec: PRECISION): string {
    const output = this.children
      ?.map((child) => {
        const childResult = `| - ${child.toString(prec)}`;
        return childResult.replace(/\n/g, `\n|   `);
      })
      .join('\n|\n');
    const outTiming: number = prec === 'ns' ? Number(this.timing) : prec === 'ms' ? Number(this.timing) / 1000000 : Number(this.timing) / 1000000000;
    return `${this.semanticId} - ${(prec === 'ns') ? outTiming : (prec === 'ms') ? outTiming.toFixed(2) : outTiming.toFixed(4)}${prec}${output ? `\n${output}` : ''}`;
  }

  /**
   * Creates a new result from an object.
   *
   * @static
   * @param {{ semanticId: string; timing: BigInt; children?: Result[] }} obj
   * @returns {Result}
   * @memberof Result
   */
  static fromObject(obj: { semanticId: string; timing: BigInt; children?: Result[] }): Result {
    return new Result(obj.semanticId, obj.timing, obj.children);
  }
}
