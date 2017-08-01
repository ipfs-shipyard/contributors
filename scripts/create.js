const Async = require('async')
const debug = require('debug')('contribs:create')
const { fetchContributors, writeDataFile, writeContentFile, getImagesDirPath, contentFileExists } = require('./lib/contributors')
const { moveFiles } = require('./lib/file-system')
const { downloadPhotos } = require('./lib/photo-transfer')
const { resizePhotos } = require('./lib/photo-manipulate')

function create (name, opts, cb) {
  if (!name) return process.nextTick(() => cb(new Error('Project name is required')))

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  debug(`Creating new project "${name}"`)

  opts = opts || {}
  opts.cwd = opts.cwd || process.cwd()

  contentFileExists(opts.cwd, name, (err, exists) => {
    if (err) return cb(err)
    if (exists) return cb(new Error(`Project "${name}" already exists in ${opts.cwd}`))

    // Page style
    opts.title = opts.title || name
    opts.rows = opts.rows || 5
    opts.breakpoint = opts.breakpoint || '570px'
    opts.spacingBig = opts.spacingBig || 0
    opts.spacingSmall = opts.spacingSmall || Math.round(opts.spacingBig / 2)
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
    opts.photoWidthBig = opts.photoWidthBig || 240
    opts.photoHeightBig = opts.photoHeightBig || Math.round((opts.photoWidthBig / 5) * 6)
    opts.photoWidthSmall = opts.photoWidthSmall || Math.round(opts.photoWidthBig * 0.5)
    opts.photoHeightSmall = opts.photoHeightSmall || Math.round((opts.photoWidthSmall / 5) * 6)
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
        opts.resizePhotos(results.originalPhotos, opts.photoWidthBig, opts.photoHeightBig, {
          concurrency: opts.photoResizeConcurrency,
          backgroundColor: opts.photoBackgroundColor,
          ratio: opts.photoResizeRatio
        }, cb)
      }],

      smallPhotos: ['originalPhotos', (results, cb) => {
        opts.resizePhotos(results.originalPhotos, opts.photoWidthSmall, opts.photoHeightSmall, {
          concurrency: opts.photoResizeConcurrency,
          backgroundColor: opts.photoBackgroundColor,
          ratio: opts.photoResizeRatio
        }, cb)
      }],

      movedPhotos: ['bigPhotos', 'smallPhotos', (results, cb) => {
        const srcs = results.bigPhotos.concat(results.smallPhotos).filter(Boolean)
        const dest = getImagesDirPath(opts.cwd, name)
        moveFiles(srcs, dest, { concurrency: opts.photoMoveConcurrency }, cb)
      }],

      dataFile: ['contributors', 'bigPhotos', 'smallPhotos', (results, cb) => {
        const { contributors, bigPhotos, smallPhotos } = results
        const photos = { big: bigPhotos, small: smallPhotos }
        const config = {
          contributorsEndpoint: opts.contributorsEndpoint,
          contributorsOrg: opts.contributorsOrg,
          photoWidthBig: opts.photoWidthBig,
          photoHeightBig: opts.photoHeightBig,
          photoWidthSmall: opts.photoWidthSmall,
          photoHeightSmall: opts.photoHeightSmall,
          photoBackgroundColor: opts.photoBackgroundColor,
          rows: opts.rows,
          breakpoint: opts.breakpoint,
          spacingBig: opts.spacingBig,
          spacingSmall: opts.spacingSmall
        }
        writeDataFile(opts.cwd, name, contributors, photos, config, cb)
      }],

      contentFile: (cb) => {
        writeContentFile(opts.cwd, name, { title: opts.title }, cb)
      }
    }, cb)
  })
}

module.exports = create
