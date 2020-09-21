import { TransactionData } from '..';
import { TransactionInstance } from '../storage/models';

export interface TransactionResult {
  max: number;
  min: number;

  avg: number;

  p50: number;
  p75: number;
  p95: number;
  p99: number;

  instances: (TransactionInstance & { data: TransactionData })[];

  children: TransactionResultCollection;
}

export interface TransactionResultCollection {
  [semanticId: string]: TransactionResult;
}
