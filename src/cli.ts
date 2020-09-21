#!/usr/bin/env node
import { analyze, printStdout } from './analyze';
import { HELP_MESSAGE, ANALYZE_HELP_MESSAGE } from './cli.const';
import { PRECISION } from './models';
import { Drivers } from './storage';

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
      const driverIndex = analyzeArgs.indexOf('--driver');
      if (driverIndex < 0) exit(1, 'No driver specified');
      const driver = analyzeArgs[driverIndex + 1];

      if (!['lowdb', 'mongodb'].includes(driver)) exit(1, `${driver} not found`);

      const dbNameIndex = analyzeArgs.indexOf('--dbName');
      if (dbNameIndex < 0) exit(1, 'No dbName specified');
      const dbName = analyzeArgs[dbNameIndex + 1];

      let dbUrl: string | undefined;
      let dbUser: string | undefined;
      let dbPassword: string | undefined;

      if (driver === 'mongodb') {
        exit(1, 'mongodb not implemented yet');
        const dbUrlIndex = analyzeArgs.indexOf('--dbUrl');
        if (dbUrlIndex < 0) exit(1, 'No dbUrl specified');
        dbUrl = analyzeArgs[dbUrlIndex + 1];

        const dbUserIndex = analyzeArgs.indexOf('--dbUser');
        if (dbUserIndex < 0) exit(1, 'No dbUser specified');
        dbUser = analyzeArgs[dbUserIndex + 1];

        const dbPasswordIndex = analyzeArgs.indexOf('--dbPassword');
        if (dbPasswordIndex < 0) exit(1, 'No dbPassword specified');
        dbPassword = analyzeArgs[dbPasswordIndex + 1];
      }

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

      const result = await analyze(driver as Drivers, { dbName, dbUrl, dbUser, dbPassword });

      if (output === 'stdout') {
        printStdout(result, precision as PRECISION);
      }
    }
  } else {
    exit(1, `Command ${args[0]} not supported`);
  }
}

function isHelp(arg: string) {
  return ['--help', '-help', 'help', '--h', '-h', 'h', '--?', '-?', '?'].includes(arg);
}

function exit(code: number, message?: string) {
  if (message) console.log(message);
  process.exit(code);
}
