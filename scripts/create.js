const Path = require('path')
const Async = require('async')
const debug = require('debug')('contribs:create')
const { fetchContributors, writeDataFile, writeContentFile } = require('./lib/contributors')
const { moveFiles } = require('./lib/file-system')
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
  opts.contributorsOrg = opts.contributorsOrg || 'all'
  opts.contributorsEndpoint = opts.contributorsEndpoint || 'https://contributors.cloud.ipfs.team/contributors'
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
      opts.fetchContributors({
        endpoint: opts.contributorsEndpoint,
        org: opts.contributorsOrg
      }, cb)
    },

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
    }],

    movedPhotos: ['bigPhotos', 'smallPhotos', (results, cb) => {
      const srcs = results.bigPhotos.concat(results.smallPhotos).filter(Boolean)
      const dest = Path.join(opts.cwd, 'static', 'images', name)
      moveFiles(srcs, dest, { concurrency: opts.photoMoveConcurrency }, cb)
    }],

    dataFile: ['contributors', 'bigPhotos', 'smallPhotos', (results, cb) => {
      const { contributors, bigPhotos, smallPhotos } = results
      const dest = Path.join(opts.cwd, 'data', 'projects')
      const photos = { big: bigPhotos, small: smallPhotos }
      const config = {
        contributorsEndpoint: opts.contributorsEndpoint,
        contributorsOrg: opts.contributorsOrg,
        photoSizeBig: opts.photoSizeBig,
        photoSizeSmall: opts.photoSizeSmall,
        photoBackgroundColor: opts.photoBackgroundColor
      }
      writeDataFile(dest, name, contributors, photos, config, cb)
    }],

    contentFile: (cb) => {
      const dest = Path.join(opts.cwd, 'content', 'projects')
      writeContentFile(dest, name, { title: opts.title }, cb)
    }
  }, cb)
}

module.exports = create
