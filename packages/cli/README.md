<!-- markdownlint-disable MD041 -->
[![trace-it-cli](https://socialify.git.ci/matzehecht/trace-it-cli/image?description=1&descriptionEditable=%E2%8F%B1%20Lowdb%20adapter%20for%20trace-it%20%F0%9F%94%8D&font=Raleway&logo=https%3A%2F%2Fgithub.com%2Fmatzehecht%2Ftrace-it%2Fraw%2Fmain%2Fmisc%2Ftrace-it.png&pattern=Brick%20Wall&theme=Light))](https://github.com/matzehecht/trace-it-cli)
<!-- markdownlint-enable MD041 -->

<!-- markdownlint-disable MD026 -->
# :clock1: CLI Tool for [Trace-it](https://github.com/matzehecht/trace-it) :mag_right:
<!-- markdownlint-enable MD026 -->

![Release](https://github.com/matzehecht/trace-it-cli/workflows/Release/badge.svg?branch=main) [![npm (scoped)](https://img.shields.io/npm/v/@trace-it/cli)](https://www.npmjs.org/package/@trace-it/cli) [![NPM](https://img.shields.io/npm/l/@trace-it/cli)](https://github.com/matzehecht/trace-it-cli/blob/dev/LICENSE) [![npm](https://img.shields.io/npm/dm/@trace-it/cli)](https://www.npmjs.org/package/@trace-it/cli)

This package provides some cli tools for the performance measuring tool [trace-it]([https](https://github.com/matzehecht/trace-it)).

- [:clock1: CLI Tool for Trace-it :mag_right:](#-cli-tool-for-trace-it-)
  - [INTALLATION](#intallation)
  - [USAGE](#usage)
    - [:chart_with_upwards_trend: Analyze](#-analyze)
    - [:x: Clear](#-clear)
  - [Changelog](#changelog)
  - [License](#license)

## INTALLATION

The cool thing with npx (and this tool) is: You do not have to install it! You can simply run it by calling `npx @trace-it/cli <command>` and npx will do the rest.
If you want to install it (to use a specific version or similar) you can also install it:

```bash
# locally
npm install @trace-it/cli --save-dev

# or
# global
npm install @trace-it/cli --global
```

## USAGE

You can print the whole USAGE instractions by calling `npx @trace-it/cli --help`. **In general you can append `--help` after each command.**

This cli tool provides two base commands: `analyze` and `clear`:

### :chart_with_upwards_trend: Analyze

To call the analyzation features do the following:

```sh
npx @trace-it/cli analyze --help
```

```sh
USAGE: npx @trace-it/cli analyze <OPTIONS>

MANDATORY OPTIONS:
    --driver            The storage driver ('lowdb' or 'mongodb').
    --dbName            The database name (or filePath for lowdb).
    --dbUrl             The database url (not used for lowdb).
    --dbUser            The database user (not used for lowdb).
    --dbPassword        The database password (not used for lowdb).

    --precision         The precision of the measured values ('ns', 'ms' or 's').
                        Default: 'ms'.

    --output            Output format ('stdout' or 'html').           # HTML is coming soon.
    --outputFile        Output file name (used for html).
```

The stdout output does only print some basic information:

```sh
$ npx @trace-it/cli analyze --driver lowdb --dbName ./perf.json  --output stdout
semanticId           count    # children    max         min         avg         p50         p75         95          p99
root                 1        2             270.85ms    270.85ms    270.85ms    270.85ms    270.85ms    270.85ms    270.85ms
|- child1            10       0             17.14ms     14.82ms     15.59ms     15.42ms     15.76ms     16.75ms     17.06ms
|- child2            5        1             24.24ms     17.91ms     20.38ms     19.42ms     21.21ms     23.63ms     24.12ms
|  |- child2child    5        0             4.36ms      2.25ms      3.10ms      3.06ms      3.14ms      4.12ms      4.31ms
```

The html output will print more information like the separate transaction runs, the related transaction data, the hierarchy of the runs and similar.

### :x: Clear

This feature will clear all measurement that are available in the storage.

```sh
npx @trace-it/cli clear --help
```

```sh
USAGE: trace-it clear <OPTIONS>

MANDATORY OPTIONS:
    --driver            The storage driver ('lowdb' or 'mongodb').
    --dbName            The database name (or filePath for lowdb).
    --dbUrl             The database url (not used for lowdb).
    --dbUser            The database user (not used for lowdb).
    --dbPassword        The database password (not used for lowdb).
```

## Changelog

See changes for each version in the [release notes](https://github.com/matzehecht/trace-it/releases).

## License

MIT - [Matthias Hecht](https://github.com/matzehecht)
