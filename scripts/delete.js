const Fs = require('fs')
const Path = require('path')
const Async = require('async')
const debug = require('debug')('contribs:delete')
const rimraf = require('rimraf')

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
      const contentFilePath = Path.join(opts.cwd, 'content', 'projects', `${name}.md`)
      debug(`Deleting ${contentFilePath}`)
      Fs.unlink(contentFilePath, cb)
    },
    (cb) => {
      const dataFilePath = Path.join(opts.cwd, 'data', 'projects', `${name}.json`)
      debug(`Deleting ${dataFilePath}`)
      Fs.unlink(dataFilePath, cb)
    },
    (cb) => {
      const imagesDir = Path.join(opts.cwd, 'static', 'images', `${name}`)
      debug(`Deleting ${imagesDir}`)
      rimraf(imagesDir, cb)
    }
  ], cb)
}

module.exports = del
