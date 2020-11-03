<!-- markdownlint-disable MD041 -->
[![trace-it](https://socialify.git.ci/matzehecht/trace-it/image?description=1&descriptionEditable=%E2%8F%B1%20Lightweight%20performance%20tracing%20%F0%9F%94%8D&font=Raleway&issues=1&logo=https%3A%2F%2Fgithub.com%2Fmatzehecht%2Ftrace-it%2Fraw%2Fmain%2Fmisc%2Ftrace-it.png&pattern=Brick%20Wall&stargazers=1&theme=Light)](https://github.com/matzehecht/trace-it)
<!-- markdownlint-enable MD041 -->

<!-- markdownlint-disable MD026 -->
# :clock1: Trace-it :mag_right:
<!-- markdownlint-enable MD026 -->

![Release](https://github.com/matzehecht/trace-it/workflows/Release/badge.svg?branch=main) [![npm](https://img.shields.io/npm/v/trace-it)](https://www.npmjs.org/package/trace-it) [![NPM](https://img.shields.io/npm/l/trace-it)](https://github.com/matzehecht/trace-it/blob/main/LICENSE) [![npm](https://img.shields.io/npm/dm/trace-it)](https://www.npmjs.org/package/trace-it)

> This package provides a lightweight performance tracing/measuring tool based on transaction trees. (Inspired by the performance monitoring from sentry.io. But is not distributed).

**Cool things**: Nearly no dependencies, Stupidly simple but really feature-rich and battery-included.

```typescript
const transaction = TraceIt.startTransaction('root');
// Do something.
transaction.end();
```

- [:clock1: Trace-it :mag_right:](#-trace-it-)
  - [Install](#install)
  - [USAGE](#usage)
    - [Basic](#basic)
      - [Enriching transaction data](#enriching-transaction-data)
      - [Result](#result)
    - [Advanced](#advanced)
    - [:chart_with_upwards_trend: Analyze](#-analyze)
    - [Additional stuff](#additional-stuff)
      - [CLI](#cli)
    - [Related packages](#related-packages)
  - [Changelog](#changelog)
  - [License](#license)

## Install

```sh
npm install trace-it
```

```typescript
// Typescript / ES module import
import * as TraceIt from 'trace-it';

// Plain javascript require
const traceit = require('trace-it');
```

## USAGE

### Basic

In the default configuration trace-it will only trace in memory. You can start transaction and end it. This is all you have to do. `startTransaction()` takes a semantic id as parameter. This should be a unique identifier indicating what is done during this transaction. **Attention:** This should not be dynamic because it will be used for grouping in other features. For dynamic data describing one transaction run you can enrich this transaction data (as described [later](#enriching-transaction-data)).

```typescript
const transaction = TraceIt.startTransaction('root');
// Do something.
transaction.end();
```

If you think something in between this transaction is worth it to take a closer look you can start a child transaction to create a transaction tree. And it is as easy as it is easy to start a parent transaction:

```typescript
const transaction = TraceIt.startTransaction('root');
// Do something.
const childTransaction: TraceIt.Transaction = transaction.startChild('something');
// Do something worth to have a closer look (eg a db query).
childTransaction.end();
// Do something afterwards.
transaction.end();
```

#### Enriching transaction data

Sometimes you need more information on transaction runs. This information will be stored and visualized in the analyzation. And again it is as easy as going to the callback hell in plain javascript:

```typescript
transaction.set('some-key', 'some-value');    // value can be of any type.
```

Or if you have more complex data:

```typescript
const data = {
  key: 'value',
  key2: 1
};
transaction.set(data)
```

#### Result

As the basic usage only uses memory the result and the transaction will be gone after the script ended. To get the result the end function is returning (as a Promise) the Result of the transaction and it's children.

```typescript
const result = await transaction.end();
console.log(result.semanticId);                     // The semantic id of the transaction
console.log(result.timing);                         // The timing of the transaction (in ns)
console.log(result.children);                       // Array of children results
console.log(result.toString(TraceIt.PRECISION.MS)); // Serializes the transactions and it's children.
```

### Advanced

Now a little advanced usage.  
Storing the transaction result only in the memory can be cool but not really helpful to do tracing on long running applications.  
So I can happily announce that trace-it also has adapters for writing to a database. These adapters are provided as plugins by other packages (so you only have to load the adapter you want).
You can find all adapters tagged with trace-it-adapter on npm ([here](https://www.npmjs.com/search?q=keywords%3Atrace-it-adapter)). Examples for such adapters are the adapter to a local [lowdb](https://github.com/typicode/lowdb) ([here](https://www.npmjs.com/package/@trace-it/lowdb-adapter)) and to mongodb ([here](https://www.npmjs.com/package/@trace-it/mongodb-adapter)).
To connect to a database you only have to initialize trace-it before using it.

```typescript
import { LowDbAdapter } from '@trace-it/lowdb-adapter';

// For lowdb the dbName is used to specify the json file
const adapter = new LowDbAdapter({ dbName: './perf.json'});
TraceIt.init(adapter);
const transaction = TraceIt.startTransaction('root');
// ...
```

### :chart_with_upwards_trend: Analyze

Now we do have data. But are not using it. That's why trace-it has analyzation features.  
The features are used via a [cli](https://www.npmjs.com/package/@trace-it/cli). The cli tool is callable without installation:

```sh
npx @trace-it/cli --help
```

To call the analyzation features do the following:

```sh
npx @trace-it/cli analyze --help
```

```sh
USAGE: npx @trace-it/cli analyze <OPTIONS>

MANDATORY OPTIONS:
    --driver            The storage driver ('lowdb' or 'mongodb').

    --output            Output format ('stdout' or 'html').           # HTML is coming soon.
    --outputFile        Output file name (only mandatory and used for html).

OPTIONAL OPTIONS:
    --dbName            The database name (or filePath for lowdb).
    --dbUrl             The database url (not used for lowdb).
    --dbUser            The database user (not used for lowdb).
    --dbPassword        The database password (not used for lowdb).

    --precision         The precision of the measured values ('ns', 'ms' or 's').
                        Default: 'ms'.
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

If you're interested in a GUI that visualizes the data stored in mongodb please let me now with a :thumbsup: on this [issue](https://github.com/matzehecht/trace-it/issues/4).

### Additional stuff

#### CLI

The cli tool was introduced [earlier](#-analyze).
The cli does have one additional command: `clear`.  
This command is used to clear the whole storage.

```sh
npx @trace-it/cli clear --help
```

```sh
USAGE: trace-it clear <OPTIONS>

MANDATORY OPTIONS:
    --driver            The storage driver ('lowdb' or 'mongodb').

OPTIONAL OPTIONS:
    --dbName            The database name (or filePath for lowdb).
    --dbUrl             The database url (not used for lowdb).
    --dbUser            The database user (not used for lowdb).
    --dbPassword        The database password (not used for lowdb).
```

### Related packages

- The cli tool:       [npm](https://www.npmjs.com/package/@trace-it/cli)
- The shared types:   [npm](https://www.npmjs.com/package/@trace-it/types)
- The lowdb adapter:  [npm](https://www.npmjs.com/package/@trace-it/lowdb-adapter)

## Changelog

See changes for each version in the [release notes](https://github.com/matzehecht/trace-it/releases).

## License

MIT - [Matthias Hecht](https://github.com/matzehecht)
