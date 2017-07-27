const Fs = require('fs')
const Path = require('path')
const mkdirp = require('mkdirp')
const Async = require('async')
const debug = require('debug')('contribs:file-system')

function writeUTF8File (dest, content, cb) {
  debug(`Writing file to ${dest}`)

  mkdirp(Path.dirname(dest), (err) => {
    if (err) return cb(err)
    Fs.writeFile(dest, content, 'utf8', cb)
  })
}

module.exports.writeUTF8File = writeUTF8File

// Move an array of file paths to the destination directory
function moveFiles (srcs, dir, opts, cb) {
  debug(`Moving ${srcs.length} files`)

  mkdirp(dir, (err) => {
    if (err) return cb(err)

    Async.mapLimit(srcs, opts.concurrency || 5, (src, cb) => {
      const dest = Path.join(dir, Path.basename(src))
      debug(`Moving ${src} to ${dest}`)

      Fs.createReadStream(src)
        .on('error', cb)
        .pipe(Fs.createWriteStream(dest))
        .on('error', cb)
        .on('close', () => cb(null, dest))
    })
  })
}

module.exports.moveFiles = moveFiles
