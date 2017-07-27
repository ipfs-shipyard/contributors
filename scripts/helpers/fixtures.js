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

function createImageServer (cb) {
  const root = Path.resolve(__dirname, '..', 'fixtures', 'images')
  const server = Http.createServer(ecstatic({ root }))

  server.listen((err) => {
    if (err) return cb(err)
    cb(null, server)
  })
}

function withImageServer (fn) {
  return function () {
    const args = Array.from(arguments)
    createImageServer((err, server) => {
      if (err) throw err
      fn.apply(this, args.concat(server))
    })
  }
}

module.exports.withImageServer = withImageServer
