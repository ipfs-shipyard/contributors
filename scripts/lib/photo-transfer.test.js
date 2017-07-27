const test = require('tape')
const Fs = require('fs')
const Path = require('path')
const Faker = require('faker')
const Mime = require('mime-types')
const { withTmpDir } = require('../helpers/tmpdir')
const { randomImage, withImageServer } = require('../helpers/fixtures')
const { downloadPhoto, downloadPhotos } = require('./photo-transfer')

test('should download a photo for a contributor to the given directory', withImageServer(withTmpDir((t, server, tmpDir) => {
  t.plan(3)

  const srcPath = randomImage()
  const srcFileName = Path.basename(srcPath)
  const { port, address, family } = server.address()
  const host = family === 'IPv6' ? `[${address}]` : address

  const contributor = {
    username: Faker.internet.userName(),
    photo: `http://${host}:${port}/${srcFileName}`
  }

  downloadPhoto(tmpDir, contributor, {}, (err, destPath) => {
    t.ifError(err, 'no error downloading photo')

    t.equal(
      destPath,
      Path.join(tmpDir, `${contributor.username}.${Mime.extension(Mime.lookup(srcFileName))}`),
      'photo saved to correct path'
    )

    t.ok(Fs.readFileSync(srcPath).equals(Fs.readFileSync(destPath)), 'src and dest contents are the same')

    server.close()
    t.end()
  })
})))

test('should ignore request errors for image download if configured', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const contributor = {
    username: Faker.internet.userName(),
    photo: 'junk'
  }

  downloadPhoto(tmpDir, contributor, { ignoreRequestErrors: true }, (err, destPath) => {
    t.ifError(err, 'no error downloading photo')
    t.notOk(destPath, 'no destination path was provided')
    t.end()
  })
}))

test('should download multiple contributor photos', withImageServer(withTmpDir((t, server, tmpDir) => {
  t.plan(3)

  const createContributor = () => {
    const srcPath = randomImage()
    const srcFileName = Path.basename(srcPath)
    const { port, address, family } = server.address()
    const host = family === 'IPv6' ? `[${address}]` : address

    return {
      username: Faker.internet.userName(),
      photo: `http://${host}:${port}/${srcFileName}`
    }
  }

  const contributors = Array(Faker.random.number({ min: 2, max: 25 })).fill(0).map(createContributor)

  downloadPhotos(contributors, {}, (err, destPaths) => {
    t.ifError(err, 'no error downloading photos')

    t.equal(contributors.length, destPaths.length, 'correct number of download file paths')
    t.ok(destPaths.every(Boolean), 'photos downloaded successfully')

    server.close()
    t.end()
  })
})))
