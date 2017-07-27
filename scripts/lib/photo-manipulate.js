const Path = require('path')
const Async = require('async')
const sharp = require('sharp')
const debug = require('debug')('contribs:photo-manipulate')

// Resize multiple photos. Resized photos are written to the same dir as the
// originals, e.g. original.jpg, original@120.jpg, original@60.jpg
//
// srcs - array of image file paths
// size - desired width/height of the photos
// opts.concurrency - number of images that should be processed concurrently
// opts.backgroundColor - color to place under each image
// cb(err, ['/path/to/photo.jpg'])
function resizePhotos (srcs, size, opts, cb) {
  debug(`Resizing ${srcs.length} photos`)

  Async.mapLimit(srcs, opts.concurrency || 5, (src, cb) => {
    if (!src) return cb() // src may be null if photo failed to download
    resizePhoto(src, size || 240, { backgroundColor: opts.backgroundColor }, cb)
  }, cb)
}

module.exports.resizePhotos = resizePhotos

// Resize a single photo. Resized photos are written to the same dir as the
// originals, e.g. original.jpg, original@120.jpg
//
// src - image file path
// size - desired width/height of the photo
// opts.backgroundColor - color to place under image
// cb(err, '/path/to/resized.jpg')
function resizePhoto (src, size, opts, cb) {
  debug(`Resizing ${src} to ${size}x${size}`)

  let image = sharp(src).resize(size, size)

  if (opts.backgroundColor) {
    image = image.background(opts.backgroundColor).embed()
  }

  const { dir, name, ext } = Path.parse(src)
  const dest = Path.join(dir, `${name}@${size}${ext}`)

  image.toFile(dest).then(() => cb(null, dest)).catch(cb)
}

module.exports.resizePhoto = resizePhoto
