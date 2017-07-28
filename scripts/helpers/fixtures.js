const Fs = require('fs')
const Path = require('path')
const Faker = require('faker')
const Http = require('http')
const ecstatic = require('ecstatic')

const imagesDir = Path.resolve(__dirname, '..', 'fixtures', 'images')
const imagePaths = Fs
  .readdirSync(imagesDir)
  .filter((name) => ['jpg', 'png', 'gif'].includes(name.slice(-3)))
  .map((name) => Path.join(imagesDir, name))

function randomImage () {
  return imagePaths[Faker.random.number({ min: 0, max: imagePaths.length - 1 })]
}

module.exports.randomImage = randomImage

function createFixturesServer (folder, cb) {
  const root = Path.resolve(__dirname, '..', 'fixtures', folder)
  const server = Http.createServer(ecstatic({ root }))

  server.listen((err) => {
    if (err) return cb(err)
    cb(null, server)
  })
}

function withFixturesServer (folder, fn) {
  return function () {
    const args = Array.from(arguments)
    createFixturesServer(folder, (err, server) => {
      if (err) throw err
      fn.apply(this, args.concat(server))
    })
  }
}

function withImageServer (fn) {
  return withFixturesServer('images', fn)
}

module.exports.withImageServer = withImageServer

function withContributorsServer (fn) {
  return withFixturesServer('contributors', fn)
}

module.exports.withContributorsServer = withContributorsServer
