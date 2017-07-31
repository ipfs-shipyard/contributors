#!/usr/bin/env node

const Fs = require('fs')
const Path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const del = require('../delete')

if (argv.usage || argv.help || argv.h) {
  console.log(Fs.readFileSync(Path.join(__dirname, 'delete.usage.txt'), 'utf8'))
  process.exit()
}

if (argv.version || argv.v) {
  console.log('v' + require('../../package.json').version)
  process.exit()
}

const opts = {}

if (argv.cwd || argv.c) {
  opts.cwd = argv.cwd || argv.c
}

del(argv._[0], opts, (err) => { if (err) throw err })
