const Path = require('path')
const Async = require('async')
const debug = require('debug')('contribs:create')
const { fetchContributors, writeDataFile, getImagesDir, readDataFile, contentFileExists } = require('./lib/contributors')
const { moveFiles } = require('./lib/file-system')
const { downloadPhotos } = require('./lib/photo-transfer')
const { resizePhotos } = require('./lib/photo-manipulate')

function update (name, opts, cb) {
  if (!name) return process.nextTick(() => cb(new Error('Project name is required')))

  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  debug(`Updating project "${name}"`)

  opts = opts || {}
  opts.projectDir = opts.projectDir || Path.resolve(__dirname, '..')

  contentFileExists(opts.projectDir, name, (err, exists) => {
    if (err) return cb(err)
    if (!exists) return cb(new Error(`Project "${name}" does not exist in ${opts.projectDir}`))

    // Fetch the existing data file so we can read the configuration
    readDataFile(opts.projectDir, name, (err, data) => {
      if (err) return cb(err)

      // Page style
      opts.rows = opts.rows || data.config.rows || 4
      opts.breakpoint = opts.breakpoint || data.config.breakpoint || 570
      opts.spacingBig = opts.spacingBig || data.config.spacingBig || 0
      opts.spacingSmall = opts.spacingSmall || data.config.spacingSmall || Math.round(opts.spacingBig / 2)
      opts.animationDuration = opts.animationDuration || data.config.animationDuration || 60
      opts.animationTimingFunction = opts.animationTimingFunction || data.config.animationTimingFunction || 'linear'
      // Contributors API fetch options
      opts.fetchContributors = opts.fetchContributors || fetchContributors
      opts.contributorsOrg = opts.contributorsOrg || data.config.contributorsOrg || 'all'
      opts.contributorsEndpoint = opts.contributorsEndpoint || data.config.contributorsEndpoint || 'https://contributors.cloud.ipfs.team/contributors'
      // Downloading options
      opts.downloadPhotos = opts.downloadPhotos || downloadPhotos
      opts.photoDownloadConcurrency = opts.photoDownloadConcurrency || 5
      opts.ignorePhotoRequestErrors = opts.ignorePhotoRequestErrors || false
      // Resizing options
      opts.resizePhotos = opts.resizePhotos || resizePhotos
      opts.photoResizeConcurrency = opts.photoResizeConcurrency || 5
      opts.photoWidthBig = opts.photoWidthBig || data.config.photoWidthBig || 240
      opts.photoHeightBig = opts.photoHeightBig || data.config.photoHeightBig || Math.round((opts.photoWidthBig / 5) * 6)
      opts.photoWidthSmall = opts.photoWidthSmall || data.config.photoWidthSmall || Math.round(opts.photoWidthBig * 0.5)
      opts.photoHeightSmall = opts.photoHeightSmall || data.config.photoHeightSmall || Math.round((opts.photoWidthSmall / 5) * 6)
      opts.photoBackgroundColor = opts.photoBackgroundColor || data.config.photoBackgroundColor || null
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
            backgroundColor: opts.photoBackgroundColor
          }, cb)
        }],

        smallPhotos: ['originalPhotos', (results, cb) => {
          opts.resizePhotos(results.originalPhotos, opts.photoWidthSmall, opts.photoHeightSmall, {
            concurrency: opts.photoResizeConcurrency,
            backgroundColor: opts.photoBackgroundColor
          }, cb)
        }],

        movedPhotos: ['bigPhotos', 'smallPhotos', (results, cb) => {
          const srcs = results.bigPhotos.concat(results.smallPhotos).filter(Boolean)
          const dest = getImagesDir(opts.projectDir, name)
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
            spacingSmall: opts.spacingSmall,
            animationDuration: opts.animationDuration,
            animationTimingFunction: opts.animationTimingFunction
          }
          writeDataFile(opts.projectDir, name, contributors, photos, config, cb)
        }]
      }, cb)
    })
  })
}

module.exports = update
