const Path = require('path')
const Fs = require('fs')
const { F_OK } = Fs.constants
const Yaml = require('yamljs')
const debug = require('debug')('contribs:contributors')
const Request = require('request')
const { writeUTF8File } = require('./file-system')

function fetchContributors (opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}
  opts.org = opts.org || 'all'
  opts.endpoint = opts.endpoint || 'https://contributors.cloud.ipfs.team/contributors'

  debug(`Fetching contributors for organisation "${opts.org}" from ${opts.endpoint}`)

  Request.get({
    url: opts.endpoint,
    qs: { org: opts.org },
    json: true
  }, (err, res, body) => {
    if (err) return cb(err)

    if (res.statusCode !== 200) {
      return cb(new Error(`Unexpected status from contributors API (${res.statusCode})`))
    }

    cb(null, body)
  })
}

module.exports.fetchContributors = fetchContributors

function getDataFilePath (cwd, name) {
  return Path.join(cwd, 'data', 'projects', `${name}.json`)
}

module.exports.getDataFilePath = getDataFilePath

function writeDataFile (cwd, name, contributors, photos, config, cb) {
  const dest = getDataFilePath(cwd, name)
  debug(`Writing data file to ${dest}`)

  const data = {
    config,
    contributors: contributors.map((c, i) => {
      const big = photos.big[i] ? `/images/${name}/${Path.basename(photos.big[i])}` : c.photo
      const small = photos.small[i] ? `/images/${name}/${Path.basename(photos.small[i])}` : c.photo
      return Object.assign({}, c, { photo: { big, small } })
    })
  }

  writeUTF8File(dest, JSON.stringify(data, null, 2), cb)
}

module.exports.writeDataFile = writeDataFile

function readDataFile (cwd, name, cb) {
  Fs.readFile(getDataFilePath(cwd, name), (err, data) => {
    if (err) return cb(err)

    try {
      data = JSON.parse(data)
    } catch (err) {
      return cb(err)
    }

    cb(null, data)
  })
}

module.exports.readDataFile = readDataFile

function getContentFilePath (cwd, name) {
  return Path.join(cwd, 'content', 'projects', `${name}.md`)
}

module.exports.getContentFilePath = getContentFilePath

function contentFileExists (cwd, name, cb) {
  Fs.access(getContentFilePath(cwd, name), F_OK, (err) => cb(null, !err))
}

module.exports.contentFileExists = contentFileExists

function writeContentFile (cwd, name, data, cb) {
  const dest = getContentFilePath(cwd, name)
  debug(`Writing content file to ${dest}`)

  const content = data && Object.keys(data).length > 0
    ? '---\n' + Yaml.stringify(data) + '---\n'
    : ''

  writeUTF8File(dest, content, cb)
}

module.exports.writeContentFile = writeContentFile

function getImagesDirPath (cwd, name) {
  return Path.join(cwd, 'static', 'images', name)
}

module.exports.getImagesDirPath = getImagesDirPath
