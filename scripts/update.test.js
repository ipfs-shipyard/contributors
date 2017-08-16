const test = require('tape')
const Faker = require('faker')
const update = require('./update')
const { withTmpDir } = require('./helpers/tmpdir')

test('should require project name', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = ''

  update(name, { projectDir: tmpDir }, (err) => {
    t.ok(err, 'expected error updating project')
    t.equals(err.message, 'Project name is required', 'correct error was raised')
    t.end()
  })
}))

test('should not update unless content file exists', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = Faker.internet.userName()

  update(name, { projectDir: tmpDir }, (err) => {
    t.ok(err, 'expected error updating project')
    t.equals(err.message, `Project "${name}" does not exist in ${tmpDir}`, 'correct error was raised')
    t.end()
  })
}))
