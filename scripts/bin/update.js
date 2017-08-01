#!/usr/bin/env node

const Fs = require('fs')
const Path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const update = require('../update')

if (argv.usage || argv.help || argv.h) {
  console.log(Fs.readFileSync(Path.join(__dirname, 'update.usage.txt'), 'utf8'))
  process.exit()
}

if (argv.version || argv.v) {
  console.log('v' + require('../../package.json').version)
  process.exit()
}

const opts = {}

if (argv.org || argv.o) {
  opts.contributorsOrg = argv.org || argv.o
}

if (argv.width || argv.w) {
  opts.photoWidthBig = argv.width || argv.w
}

if (argv.spacing || argv.s) {
  opts.spacingBig = argv.spacing || argv.s
}

if (argv.background || argv.b) {
  opts.photoBackgroundColor = argv.background || argv.b
}

if (argv.breakpoint || argv.r) {
  opts.breakpoint = argv.breakpoint || argv.r
}

if (argv.endpoint || argv.e) {
  opts.contributorsEndpoint = argv.endpoint || argv.e
}

if (argv.cwd || argv.c) {
  opts.cwd = argv.cwd || argv.c
}

console.log('Please wait...')

update(argv._[0], opts, (err) => { if (err) throw err })
