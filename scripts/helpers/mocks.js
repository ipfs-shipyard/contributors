const Fs = require('fs')
const Path = require('path')
const Async = require('async')
const { mkTmpDir } = require('./tmpdir')
const { fakeContributors } = require('./fakes')
const { randomImage } = require('./fixtures')

// Creates a function to mock fetching the contributors list from the API
function mockFetchContributors (contributors) {
  return (opts, cb) => process.nextTick(() => cb(null, contributors || fakeContributors()))
}

module.exports.mockFetchContributors = mockFetchContributors

// Creates a function to mock downloading photos (images from the fixtures directory)
function mockDownloadPhotos () {
  return (contributors, opts, cb) => {
    mkTmpDir((err, dir) => {
      if (err) return cb(err)

      Async.map(contributors, (c, cb) => {
        const src = randomImage()
        const dest = Path.join(dir, `${c.username}${Path.extname(src)}`)

        Fs.createReadStream(src)
          .on('error', cb)
          .pipe(Fs.createWriteStream(dest))
          .on('error', cb)
          .on('close', () => cb(null, dest))
      }, cb)
    })
  }
}

module.exports.mockDownloadPhotos = mockDownloadPhotos
