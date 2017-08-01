const Fs = require('fs')
const Async = require('async')
const debug = require('debug')('contribs:delete')
const rimraf = require('rimraf')
const { getContentFilePath, getDataFilePath, getImagesDirPath } = require('./lib/contributors')

function del (name, opts, cb) {
  if (!name) return process.nextTick(() => cb(new Error('Project name is required')))

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  debug(`Deleting project "${name}"`)

  opts = opts || {}
  opts.cwd = opts.cwd || process.cwd()

  Async.parallel([
    (cb) => {
      const contentFilePath = getContentFilePath(opts.cwd, name)
      debug(`Deleting ${contentFilePath}`)
      Fs.unlink(contentFilePath, cb)
    },
    (cb) => {
      const dataFilePath = getDataFilePath(opts.cwd, name)
      debug(`Deleting ${dataFilePath}`)
      Fs.unlink(dataFilePath, cb)
    },
    (cb) => {
      const imagesDir = getImagesDirPath(opts.cwd, name)
      debug(`Deleting ${imagesDir}`)
      rimraf(imagesDir, cb)
    }
  ], cb)
}

module.exports = del
