const PRE_HELP_MESSAGE = `trace-it
MIT Licensed.
Written by Matthias Hecht (https://github.com/matzehecht).
Source available: https://github.com/matzehecht/trace-it

Documentation: https://github.com/matzehecht/trace-it/README.md`;

export const HELP_MESSAGE = `${PRE_HELP_MESSAGE}
CLI tool related to trace-it.

USAGE: trace-it <COMMAND>

AVAILABLE COMMANDS:
    analyze             Tool to analyze measured performance.
    clear               Clears the transaction data.`;

export const ANALYZE_HELP_MESSAGE = `${PRE_HELP_MESSAGE}
CLI tool to analyze measured performance

USAGE: trace-it analyze <OPTIONS>

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

export const CLEAR_HELP_MESSAGE = `${PRE_HELP_MESSAGE}
CLI tool to clear the measured performance

USAGE: trace-it clear <OPTIONS>

MANDATORY OPTIONS:
    --driver            The storage driver ('lowdb' or 'mongodb').
    --dbName            The database name (or filePath for lowdb).
    --dbUrl             The database url (not used for lowdb).
    --dbUser            The database user (not used for lowdb).
    --dbPassword        The database password (not used for lowdb).`;
