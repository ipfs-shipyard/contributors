const test = require('tape')
const Fs = require('fs')
const Path = require('path')
const Faker = require('faker')
const { withTmpDir } = require('../helpers/tmpdir')
const { writeUTF8File } = require('./file-system')

test('should write file and create any inbetween directories that do not exist', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const dest = Path.join(tmpDir, 'foo', 'bar', 'baz', 'file.txt')
  const contents = Faker.lorem.paragraph()

  writeUTF8File(dest, contents, (err) => {
    t.ifError(err, 'no error writing file')
    t.equal(Fs.readFileSync(dest, 'utf8'), contents, 'file exists and contents are correct')
    t.end()
  })
}))
