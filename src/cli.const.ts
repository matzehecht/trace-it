import * as fs from 'fs';
const { version, homepage } = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const PRE_HELP_MESSAGE = `performance-tracing v${version}
MIT Licensed.
Written by Matthias Hecht (https://github.com/matzehecht).
Source available: ${homepage}

Documentation: ${homepage}/README.md`;

export const HELP_MESSAGE = `${PRE_HELP_MESSAGE}
CLI tool related to performance-tracing

USAGE: performance-tracing <COMMAND>

AVAILABLE COMMANDS:
    analyze             Tool to analyze measured performance.`;

export const ANALYZE_HELP_MESSAGE = `${PRE_HELP_MESSAGE}
CLI tool to analyze measured performance

USAGE: performance-tracing analyze <OPTIONS>

MANDATORY OPTIONS:
    --driver            The storage driver ('lowdb' or 'mongodb').
    --dbName            The database name (or filePath for lowdb).
    --dbUrl             The database url (not used for lowdb).
    --dbUser            The database user (not used for lowdb).
    --dbPassword        The database password (not used for lowdb).

    --precision         The precision of the measured values ('ns', 'ms' or 's').
                        Default: 'ms'.

    --output            Output format ('stdout' or 'html').
    --outputFile        Output file name (used for html).`;
