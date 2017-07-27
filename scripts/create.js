const Path = require('path')
const YAML = require('json2yaml')
const Async = require('async')
const debug = require('debug')('contribs:create')
const { fetchContributors } = require('./lib/contributors-api')
const { writeUTF8File } = require('./lib/file-system')
const { downloadPhotos } = require('./lib/photo-transfer')
const { resizePhotos } = require('./lib/photo-manipulate')

function create (name, opts, cb) {
  if (!name) return cb(new Error('Project name is required'))

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  debug(`Creating new project "${name}"`)

  opts = opts || {}
  opts.title = opts.title || name
  opts.cwd = opts.cwd || process.cwd()
  // Contributors API fetch options
  opts.fetchContributors = opts.fetchContributors || fetchContributors
  // Downloading options
  opts.downloadPhotos = opts.downloadPhotos || downloadPhotos
  opts.photoDownloadConcurrency = opts.photoDownloadConcurrency || 5
  opts.ignorePhotoRequestErrors = opts.ignorePhotoRequestErrors || false
  // Resizing options
  opts.resizePhotos = opts.resizePhotos || resizePhotos
  opts.photoResizeConcurrency = opts.photoResizeConcurrency || 5
  opts.photoSizeBig = opts.photoSizeBig || 240
  opts.photoSizeSmall = opts.photoSizeSmall || Math.round(opts.photoSizeBig * 0.5)
  opts.photoBackgroundColor = opts.photoBackgroundColor || null
  // Move options
  opts.photoMoveConcurrency = opts.photoMoveConcurrency || 5

  Async.auto({
    contributors: (cb) => {
      opts.fetchContributors(cb)
    },
    contentFile: (cb) => {
      const path = Path.join(opts.cwd, 'content', 'projects', `${name}.md`)
      writeUTF8File(path, YAML.stringify({ title: opts.title }) + '---\n', cb)
    },
    dataFile: ['contributors', (results, cb) => {
      const path = Path.join(opts.cwd, 'data', 'projects', `${name}.json`)
      writeUTF8File(path, JSON.stringify(results.contributors, null, 2), cb)
    }],
    originalPhotos: ['contributors', (results, cb) => {
      opts.downloadPhotos(results.contributors, {
        concurrency: opts.photoDownloadConcurrency,
        ignoreRequestErrors: opts.ignorePhotoRequestErrors
      }, cb)
    }],
    bigPhotos: ['originalPhotos', (results, cb) => {
      opts.resizePhotos(results.originalPhotos, opts.photoSizeBig, {
        concurrency: opts.photoResizeConcurrency,
        backgroundColor: opts.photoBackgroundColor
      }, cb)
    }],
    smallPhotos: ['originalPhotos', (results, cb) => {
      opts.resizePhotos(results.originalPhotos, opts.photoSizeSmall, {
        concurrency: opts.photoResizeConcurrency,
        backgroundColor: opts.photoBackgroundColor
      }, cb)
    }]
  }, cb)
}

if (module.parent) {
  module.exports = create
}
