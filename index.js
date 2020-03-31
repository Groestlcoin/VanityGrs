#! /usr/bin/env node

const VanityGrs = require('./libs/VanityGrs');
const ora = require('ora');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .example('$0 -i CAFE', 'get a wallet where address starts with FCAFE')
  .example('$0 -n 25 -i ABC', 'get 25 vanity wallets which start with FABC')
  .example('$0 -n 1000', 'get 1000 random wallets')
  .alias('i', 'input')
  .string('i')
  .describe('i', 'input string')
  .alias('n', 'count')
  .number('n')
  .describe('n', 'number of wallets')
  .alias('l', 'log')
  .boolean('l')
  .describe('l', 'log output to file')
  .help('h')
  .alias('h', 'help')
  .epilog('copyright 2020 by Groestlcoin Developers')
  .argv;
if (cluster.isMaster) {
  const args = {
    input: argv.input ? argv.input : '',
    numWallets: argv.count ? argv.count : 1,
    log: !!argv.log,
    logFname: argv.log ? 'VanityGrs-log-' + Date.now() + '.txt' : ''
  };
  if (!VanityGrs.isValidInput(args.input)) {
    console.error(args.input + ' must be number or alphabet');
    process.exit(1);
  }
  let logStream = null;
  if (args.log) {
    const fs = require('fs');
    console.log('logging into ' + args.logFname);
    logStream = fs.createWriteStream(args.logFname, { 'flags': 'a' });
  }
  let walletsFound = 0;
  const spinner = ora('generating vanity address F/' + args.numWallets).start();
  for (let i = 0; i < numCPUs; i++) {
    const worker_env = {
      input: args.input,
      isChecksum: args.isChecksum,
      isContract: args.isContract
    };
    proc = cluster.fork(worker_env);
    proc.on('message', function (message) {
      spinner.succeed(JSON.stringify(message));
      if (logStream) {
        logStream.write(JSON.stringify(message) + '\n');
      }
      walletsFound++;
      if (walletsFound >= args.numWallets) {
        cleanup();
      }
      spinner.text = 'generating vanity address ' + (walletsFound + 1) + '/' + args.numWallets;
      spinner.start();
    });
  }

} else {
  const worker_env = process.env;
  while (true) {
    process.send(VanityGrs.getVanityWallet(worker_env.input));
  }
}
process.stdin.resume();
const cleanup = function (options, err) {
  if (err) console.log(err.stack);
  for (let id in cluster.workers) {
    cluster.workers[ id ].process.kill();
  }
  process.exit();
};
process.on('exit', cleanup.bind(null, {}));
process.on('SIGINT', cleanup.bind(null, {}));
process.on('uncaughtException', cleanup.bind(null, {}));
