#!/usr/bin/env node

const Fs = require('fs')
const Path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const create = require('../create')

if (argv.usage || argv.help || argv.h) {
  console.log(Fs.readFileSync(Path.join(__dirname, 'create.usage.txt'), 'utf8'))
  process.exit()
}

if (argv.version || argv.v) {
  console.log('v' + require('../../package.json').version)
  process.exit()
}

const opts = {}

if (argv.title || argv.t) {
  opts.title = argv.title || argv.t
}

if (argv.org || argv.o) {
  opts.contributorsOrg = argv.org || argv.o
}

if (argv.size || argv.s) {
  opts.photoSizeBig = argv.size || argv.s
}

if (argv.background || argv.b) {
  opts.backgroundColor = argv.background || argv.b
}

if (argv.endpoint || argv.e) {
  opts.contributorsEndpoint = argv.endpoint || argv.e
}

if (argv.cwd || argv.c) {
  opts.cwd = argv.cwd || argv.c
}

create(argv._[0], opts, (err) => { if (err) throw err })
