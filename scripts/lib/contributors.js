const Path = require('path')
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

function writeDataFile (destDir, name, contributors, photos, config, cb) {
  const dest = Path.join(destDir, `${name}.json`)
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

function writeContentFile (destDir, name, data, cb) {
  const dest = Path.join(destDir, `${name}.md`)
  debug(`Writing content file to ${dest}`)

  const content = data && Object.keys(data).length > 0
    ? '---\n' + Yaml.stringify(data) + '---\n'
    : ''

  writeUTF8File(dest, content, cb)
}

module.exports.writeContentFile = writeContentFile
