<!-- markdownlint-disable MD041 -->
[![trace-it-mongodb-adapter](https://socialify.git.ci/matzehecht/trace-it/image?description=1&descriptionEditable=%E2%8F%B1%20Mongodb%20adapter%20for%20trace-it%20%F0%9F%94%8D&font=Raleway&logo=https%3A%2F%2Fgithub.com%2Fmatzehecht%2Ftrace-it%2Fraw%2Fmain%2Fmisc%2Ftrace-it.png&pattern=Brick%20Wall&theme=Light)](https://github.com/matzehecht/trace-it/tree/main/packages/mongodb-adapter)
<!-- markdownlint-enable MD041 -->

<!-- markdownlint-disable MD026 -->
# :clock1: Mongodb adapter for [Trace-it](https://github.com/matzehecht/trace-it) :mag_right:
<!-- markdownlint-enable MD026 -->

![Release](https://github.com/matzehecht/trace-it/workflows/Release/badge.svg?branch=main) [![npm (scoped)](https://img.shields.io/npm/v/@trace-it/mongodb-adapter)](https://www.npmjs.org/package/@trace-it/mongodb-adapter) [![NPM](https://img.shields.io/npm/l/@trace-it/mongodb-adapter)](https://github.com/matzehecht/trace-it/blob/main/LICENSE) [![npm](https://img.shields.io/npm/dm/@trace-it/mongodb-adapter)](https://www.npmjs.org/package/@trace-it/mongodb-adapter)

This is a [mongodb](https://www.mongodb.com) adapter for the performance measuring tool [trace-it](https://github.com/matzehecht/trace-it).

- [:clock1: Mongodb adapter for Trace-it :mag_right:](#-mongodb-adapter-for-trace-it-)
  - [INSTALL](#install)
  - [USAGE](#usage)
  - [Changelog](#changelog)
  - [License](#license)

## INSTALL

You can install this storage adapters with npm:

```bash
npm install @trace-it/mongodb-adapter
```

## USAGE

As the storage adapters for trace-it are plugins you only have to plug this package in on initialization of trace-it.

```typescript
import * as TraceIt from 'trace-it';
import { MongoDbAdapter } from '@trace-it/mongodb-adapter';

// For mongodb the dbName is used to specify the json file
const adapter = new MongoDbAdapter({ dbName: './perf.json'});
TraceIt.init(adapter);
const transaction = TraceIt.startTransaction('root');
// ...
```

For more information look at the `README` of the [core package](https://github.com/matzehecht/trace-it).

You are looking for other adapters? Look [here](https://www.npmjs.com/search?q=keywords%3Atrace-it-adapter).

## Changelog

See changes for each version in the [release notes](https://github.com/matzehecht/trace-it/releases).

## License

MIT - [Matthias Hecht](https://github.com/matzehecht)
