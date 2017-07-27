const test = require('tape')
const Fs = require('fs')
const Path = require('path')
const sizeOf = require('image-size')
const Faker = require('faker')
const { withTmpDir } = require('../helpers/tmpdir')
const { randomImage } = require('../helpers/fixtures')
const { resizePhoto, resizePhotos } = require('./photo-manipulate')

test('should resize a photo to the given size', withTmpDir((t, tmpDir) => {
  t.plan(3)

  const src = randomImage()
  const dest = Path.join(tmpDir, Path.basename(src))

  Fs.writeFileSync(dest, Fs.readFileSync(src))

  const size = Faker.random.number({ min: 20, max: 120 })

  resizePhoto(dest, size, {}, (err, resizedPath) => {
    t.ifError(err, 'no error resizing photo')

    const { width, height } = sizeOf(resizedPath)
    t.equal(width, size, `${Path.basename(resizedPath)} width is correct`)
    t.equal(height, size, `${Path.basename(resizedPath)} is correct`)

    t.end()
  })
}))

test('should resize multiple photos to the given size', withTmpDir((t, tmpDir) => {
  const totalImages = Faker.random.number({ min: 2, max: 25 })

  t.plan(2 + (totalImages * 2))

  const createPhotoSrc = () => {
    const src = randomImage()
    const dest = Path.join(tmpDir, `${Faker.internet.userName()}${Path.extname(src)}`)
    Fs.writeFileSync(dest, Fs.readFileSync(src))
    return dest
  }

  const srcs = Array(totalImages).fill(0).map(createPhotoSrc)
  const size = Faker.random.number({ min: 20, max: 120 })

  resizePhotos(srcs, size, {}, (err, dests) => {
    t.ifError(err, 'no error resizing photos')

    t.equal(srcs.length, dests.length, 'correct number of resized file paths')

    dests.forEach((dest) => {
      const { width, height } = sizeOf(dest)
      t.equal(width, size, `${Path.basename(dest)} width is correct`)
      t.equal(height, size, `${Path.basename(dest)} is correct`)
    })

    t.end()
  })
}))
