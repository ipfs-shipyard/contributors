const Fs = require('fs')
const Path = require('path')
const Async = require('async')
const debug = require('debug')('contribs:delete')
const rimraf = require('rimraf')
const { getContentFilePath, getDataFilePath, getImagesDir } = require('./lib/contributors')

function del (name, opts, cb) {
  if (!name) return process.nextTick(() => cb(new Error('Project name is required')))

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  debug(`Deleting project "${name}"`)

  opts = opts || {}
  opts.projectDir = opts.projectDir || Path.resolve(__dirname, '..')

  Async.parallel([
    (cb) => {
      const contentFilePath = getContentFilePath(opts.projectDir, name)
      debug(`Deleting ${contentFilePath}`)
      Fs.unlink(contentFilePath, cb)
    },
    (cb) => {
      const dataFilePath = getDataFilePath(opts.projectDir, name)
      debug(`Deleting ${dataFilePath}`)
      Fs.unlink(dataFilePath, cb)
    },
    (cb) => {
      const imagesDir = getImagesDir(opts.projectDir, name)
      debug(`Deleting ${imagesDir}`)
      rimraf(imagesDir, cb)
    }
  ], cb)
}

module.exports = del
