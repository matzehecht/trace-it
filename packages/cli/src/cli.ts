import { Adapter, InitStorageOptions, PRECISION } from '@trace-it/types';
import { LowDbAdapter } from '@trace-it/lowdb-adapter';
import { MongoDbAdapter } from '@trace-it/mongodb-adapter';

import { analyze, printStdout } from './analyze';
import { clear } from './storage';
import { HELP_MESSAGE, ANALYZE_HELP_MESSAGE, CLEAR_HELP_MESSAGE } from './cli.const';

type Drivers = 'lowdb' | 'mongodb';

run();

async function run() {
  const args = process.argv.slice(2);

  if (isHelp(args[0])) {
    exit(0, HELP_MESSAGE);
  } else if (args[0] === 'analyze') {
    const analyzeArgs = args.slice(1);

    if (isHelp(analyzeArgs[0])) {
      exit(0, ANALYZE_HELP_MESSAGE);
    } else {
      const { driver, dbName, dbUrl, dbUser, dbPassword } = getStorageOptions(analyzeArgs);

      const precisionIndex = analyzeArgs.indexOf('--precision');
      const precision = precisionIndex < 0 ? 'ms' : analyzeArgs[precisionIndex + 1];
      if (!['ns', 'ms', 's'].includes(precision)) exit(1, `${precision} not a valid precision! Choose 'ns', 'ms' or 's'.`);

      const outputIndex = analyzeArgs.indexOf('--output');
      if (outputIndex < 0) exit(1, 'No output specified');
      const output = analyzeArgs[outputIndex + 1];

      if (!['stdout', 'html'].includes(output)) exit(1, `Output ${output} not valid`);

      let outputFile: string | undefined;

      if (output === 'html') {
        // tslint:disable-next-line: no-unused-expression
        outputFile;
        exit(1, 'html not implemented yet');
        const outputFileIndex = analyzeArgs.indexOf('--outputFile');
        if (outputFileIndex < 0) exit(1, 'No outputFile specified');
        outputFile = analyzeArgs[outputFileIndex + 1];
      }

      const storage = getStorage(driver as Drivers, { dbName, dbUrl, dbUser, dbPassword });

      const result = await analyze(storage);

      if (output === 'stdout') {
        printStdout(result, precision as PRECISION);
      }
    }
  } else if (args[0] === 'clear') {
    const clearArgs = args.slice(1);

    if (isHelp(clearArgs[0])) {
      exit(0, CLEAR_HELP_MESSAGE);
    } else {
      const { driver, dbName, dbUrl, dbUser, dbPassword } = getStorageOptions(clearArgs);

      const storage = getStorage(driver as Drivers, { dbName, dbUrl, dbUser, dbPassword });

      await clear(storage);
    }
  } else {
    exit(1, `Command ${args[0]} not supported`);
  }
}

function getStorageOptions(args: string[]) {
  const driverIndex = args.indexOf('--driver');
  if (driverIndex < 0) exit(1, 'No driver specified');
  const driver = args[driverIndex + 1];

  if (!['lowdb', 'mongodb'].includes(driver)) exit(1, `${driver} not found`);

  const dbNameIndex = args.indexOf('--dbName');
  const dbName = dbNameIndex < 0 ? undefined : args[dbNameIndex + 1];

  let dbUrl: string | undefined;
  let dbUser: string | undefined;
  let dbPassword: string | undefined;

  if (driver === 'mongodb') {
    const dbUrlIndex = args.indexOf('--dbUrl');
    dbUrl = dbUrlIndex < 0 ? undefined : args[dbUrlIndex + 1];

    const dbUserIndex = args.indexOf('--dbUser');
    dbUser = dbUserIndex < 0 ? undefined : args[dbUserIndex + 1];

    const dbPasswordIndex = args.indexOf('--dbPassword');
    dbPassword = dbPasswordIndex < 0 ? undefined : args[dbPasswordIndex + 1];
  }

  return { driver, dbName, dbUrl, dbUser, dbPassword };
}

function isHelp(arg: string) {
  return ['--help', '-help', 'help', '--h', '-h', 'h', '--?', '-?', '?'].includes(arg);
}

function exit(code: number, message?: string) {
  if (message) console.log(message);
  process.exit(code);
}

function getStorage(driver: Drivers, options: InitStorageOptions): Adapter {
  switch(driver) {
    case 'lowdb':
      return new LowDbAdapter(options);
    case 'mongodb':
      return new MongoDbAdapter(options);
    default:
      exit(1, `Driver ${driver} not supported (yet).`);
      throw new Error();
  }
}
