const Os = require('os')
const Path = require('path')
const mkdirp = require('mkdirp')

function mkTmpDir (cb) {
  mkTmpDir.n = (mkTmpDir.n || 0) + 1
  const path = Path.join(Os.tmpdir(), 'contribs', `${Date.now()}-${mkTmpDir.n}`)
  mkdirp(path, (err) => cb(err, path))
}

module.exports.mkTmpDir = mkTmpDir
