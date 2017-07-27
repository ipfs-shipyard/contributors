const { mkTmpDir } = require('../lib/tmpdir')

module.exports.mkTmpDir = mkTmpDir

function withTmpDir (fn) {
  return function () {
    const args = Array.from(arguments)
    mkTmpDir((err, tmpDir) => {
      if (err) throw err
      fn.apply(this, args.concat(tmpDir))
    })
  }
}

module.exports.withTmpDir = withTmpDir
