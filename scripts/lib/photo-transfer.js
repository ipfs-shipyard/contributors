const Path = require('path')
const Fs = require('fs')
const Async = require('async')
const Request = require('request')
const Mime = require('mime-types')
const debug = require('debug')('contribs:photo-transfer')
const { mkTmpDir } = require('./tmpdir')

function downloadPhotos (contributors, opts, cb) {
  debug(`Downloading ${contributors.length} photos`)

  mkTmpDir((err, dir) => {
    if (err) return cb(err)
    debug(`Temporary photo download path is ${dir}`)
    Async.mapLimit(contributors, opts.concurrency || 10, (c, cb) => downloadPhoto(dir, c, opts, cb), cb)
  })
}

module.exports.downloadPhotos = downloadPhotos

function downloadPhoto (dir, contributor, opts, cb) {
  debug(`Downloading photo ${contributor.photo} for ${contributor.username}`)

  Request.head(contributor.photo, (err, res) => {
    if (err) {
      if (opts.ignoreRequestErrors) {
        console.warn(`Failed to get photo headers for ${contributor.username} from ${contributor.photo}`, err)
        return cb()
      }
      return cb(err)
    }

    if (res.statusCode !== 200) {
      if (opts.ignoreRequestErrors) {
        console.warn(`Failed to get photo headers for ${contributor.username} from ${contributor.photo}`, err)
        return cb()
      }
      return cb(new Error(`Unexpected status ${res.statusCode} while downloading ${contributor.photo}`))
    }

    const contentType = res.headers['content-type']
    const ext = Mime.extension(contentType)
    if (!ext) return cb(new Error(`Unknown content type "${contentType}" while downloading ${contributor.photo}`))

    const dest = Path.join(dir, `${contributor.username}.${ext}`)

    debug(`Downloading photo to ${dest}`)

    Request
      .get(contributor.photo)
      .on('error', (err) => {
        if (opts.ignoreRequestErrors) {
          console.warn(`Failed to download photo for ${contributor.username} from ${contributor.photo}`, err)
          return cb()
        }
        return cb(err)
      })
      .pipe(Fs.createWriteStream(dest))
      .on('error', cb)
      .on('close', () => cb(null, dest))
  })
}

module.exports.downloadPhoto = downloadPhoto
