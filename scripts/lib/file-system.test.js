const test = require('tape')
const Fs = require('fs')
const Path = require('path')
const Faker = require('faker')
const { withTmpDir } = require('../helpers/tmpdir')
const { writeUTF8File, moveFiles } = require('./file-system')

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

test('should move files into a directory', withTmpDir(withTmpDir((t, tmpDir0, tmpDir1) => {
  t.plan(4)

  const createFile = () => {
    const dest = Path.join(tmpDir0, `${Faker.internet.userName()}.txt`)
    Fs.writeFileSync(dest, Faker.lorem.paragraph())
    return dest
  }

  const totalSrcs = Faker.random.number({ min: 2, max: 5 })
  const srcs = Array(totalSrcs).fill(0).map(createFile)

  moveFiles(srcs, tmpDir1, {}, (err) => {
    t.ifError(err, 'no error moving files')
    t.equal(Fs.readdirSync(tmpDir0).length, 0, 'no files in src dir')
    const dests = Fs.readdirSync(tmpDir1)
    t.equal(dests.length, srcs.length, 'dest dir contains same number of files as src dir')
    t.ok(dests.every((d) => srcs.includes(Path.join(tmpDir0, d))))
    t.end()
  })
})))

test('should move files into a directory and overwrite existing files', withTmpDir(withTmpDir((t, tmpDir0, tmpDir1) => {
  t.plan(2)

  const srcFileName = 'test.txt'
  const srcContents = Faker.lorem.paragraph()
  const src = Path.join(tmpDir0, srcFileName)
  Fs.writeFileSync(src, srcContents)

  // Create file to overwrite
  Fs.writeFileSync(Path.join(tmpDir1, srcFileName), `${Date.now()}`)

  moveFiles([src], tmpDir1, {}, (err) => {
    t.ifError(err, 'no error moving files')
    t.equal(Fs.readFileSync(Path.join(tmpDir1, srcFileName), 'utf8'), srcContents, 'file overwritten')
    t.end()
  })
})))
