import { PRECISION, Adapter, TransactionData, TransactionInstance } from '@trace-it/types';

import { TransactionResult, TransactionResultCollection } from './models';

export async function analyze(storage: Adapter) {
  const result = await analyzeChildren(storage, []);
  return result;
}

async function analyzeTransaction(storage: Adapter, semanticId: string[]): Promise<TransactionResult> {
  const instances = (await storage.getInstances(semanticId));
  const timings = instances.map(({ timing }) => timing).filter(t => typeof t === 'number') as number[];

  const max = Math.max(...timings);
  const min = Math.min(...timings);

  const avg = timings.reduce((prev, cur) => prev + cur, 0) / timings.length;

  const p50 = percentile(timings, 0.5);
  const p75 = percentile(timings, 0.75);
  const p95 = percentile(timings, 0.95);
  const p99 = percentile(timings, 0.99);

  const enrichedInstances = await Promise.all(instances.map(async (instance: TransactionInstance) => {
    const data: TransactionData = await storage.getTransactionData(instance.syntacticId);
    delete data.syntacticId;
    return {...instance, data };
  }));

  return {
    max,
    min,
    avg,
    p50,
    p75,
    p95,
    p99,
    instances: enrichedInstances,
    children: await analyzeChildren(storage, semanticId)
  };
}

async function analyzeChildren(storage: Adapter, semanticId: string[]): Promise<TransactionResultCollection> {
  const childrenSemanticIds = await storage.getChildren(semanticId);

  const children = await Promise.all(childrenSemanticIds.map(async child => ({ [child[child.length - 1]]: await analyzeTransaction(storage, child)})));

  return children.reduce((prev, child) => ({...prev, ...child}), {});
}

function percentile(data: number[], percentile: number): number {
  const array = data.sort((prev, cur) => prev - cur);

  const index = (array.length - 1) * percentile;

  if (Number.isInteger(index)) {
    return array[index];
  }

  const flooredIndex = Math.floor(index);
  const fraction = index - flooredIndex;

  return array[flooredIndex] + (array[flooredIndex + 1] - array[flooredIndex]) * fraction;
}

export function printStdout(result: TransactionResultCollection, prec: PRECISION) {
  const preparedOutput = prepareStdoutOutput(result, 0, prec);

  const columnWidths = preparedOutput.reduce((prev, row) => {
    return row.map((column, i) => ((column.length + 4) > prev[i]) ? (column.length + 4) : prev[i]);
  }, new Array(preparedOutput[0].length).fill(0));

  preparedOutput.forEach(row => {
    console.log(row.reduce((prev, column, i) => {
      return prev.concat(column.padEnd(columnWidths[i], ' '));
    }, ''));
  });
}

function prepareStdoutOutput(result: TransactionResultCollection, indentLevel: number, prec: PRECISION): string[][] {
  const array: string[][] = (indentLevel !== 0) ? [] : [['semanticId', 'count', '# children', 'max', 'min', 'avg', 'p50', 'p75', '95', 'p99']];

  return array.concat(...Object.entries(result).map(([semanticId, value]) => {
    const indent = (indentLevel === 0) ? '' : ('|  '.repeat(indentLevel).substr(0, (indentLevel - 1) * 3) + '|- ');

    const thisResult = [
      [
        `${indent}${semanticId}`,
        value.instances.length.toString(),
        Object.keys(value.children).length.toString(),
        timingToString(value.max, prec),
        timingToString(value.min, prec),
        timingToString(value.avg, prec),
        timingToString(value.p50, prec),
        timingToString(value.p75, prec),
        timingToString(value.p95, prec),
        timingToString(value.p99, prec)
      ]
    ];
    return thisResult.concat(prepareStdoutOutput(value.children, indentLevel + 1, prec));
  }));
}

function timingToString(timing: number, prec: PRECISION): string {
  const outTiming: number = prec === 'ns' ? timing : prec === 'ms' ? timing / 1000000 : timing / 1000000000;
  if (prec === PRECISION.NS) {
    return `${outTiming}${prec}`;
  } else if (prec === PRECISION.MS) {
    return `${outTiming.toFixed(2)}${prec}`;
  }
  return `${outTiming.toFixed(4)}${prec}`;
}
