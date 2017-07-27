const test = require('tape')
const Fs = require('fs')
const Path = require('path')
const { F_OK, R_OK } = Fs.constants
const Async = require('async')
const create = require('./create')
const { mkTmpDir, withTmpDir } = require('./helpers/tmpdir')
const { fakeContributors } = require('./helpers/fakes')
const { randomImage } = require('./helpers/fixtures')

// Creates a function to mock fetching the contributors list from the API
function mockFetchContributors (contributors) {
  return (cb) => process.nextTick(() => cb(null, contributors || fakeContributors()))
}

// Creates a function to mock downloading photos (images from the fixtures directory)
function mockDownloadPhotos () {
  return (contributors, opts, cb) => {
    mkTmpDir((err, dir) => {
      if (err) return cb(err)

      Async.map(contributors, (c, cb) => {
        const src = randomImage()
        const dest = Path.join(dir, `${c.username}${Path.extname(src)}`)

        Fs.createReadStream(src)
          .on('error', cb)
          .pipe(Fs.createWriteStream(dest))
          .on('error', cb)
          .on('close', () => cb(null, dest))
      }, cb)
    })
  }
}

test('should require project name', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = ''
  const fetchContributors = mockFetchContributors()
  const downloadPhotos = mockDownloadPhotos()

  create(name, { cwd: tmpDir, fetchContributors, downloadPhotos }, (err) => {
    t.ok(err, 'expected error creating new project')
    t.equals(err.message, 'Project name is required', 'correct error was raised')
    t.end()
  })
}))

test('should create content file', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = 'test-project'
  const fetchContributors = mockFetchContributors()
  const downloadPhotos = mockDownloadPhotos()

  create(name, { cwd: tmpDir, fetchContributors, downloadPhotos }, (err) => {
    t.ifError(err, 'no error creating new project')
    const expectedPath = Path.join(tmpDir, 'content', 'projects', `${name}.md`)
    t.doesNotThrow(() => Fs.accessSync(expectedPath, F_OK | R_OK), 'content file exists and can be read')
    t.end()
  })
}))

test('should default content file title to project name if not defined', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = 'test-project'
  const fetchContributors = mockFetchContributors()
  const downloadPhotos = mockDownloadPhotos()

  create(name, { cwd: tmpDir, fetchContributors, downloadPhotos }, (err) => {
    t.ifError(err, 'no error creating new project')

    const expectedPath = Path.join(tmpDir, 'content', 'projects', `${name}.md`)
    const expectedContent = `
---
  title: "${name}"
---
    `.trim() + '\n'

    t.equals(Fs.readFileSync(expectedPath, 'utf8'), expectedContent, 'content file contents are correct')
    t.end()
  })
}))

test('should set content file title if specified', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = 'test-project'
  const title = 'Test Project 3000'
  const fetchContributors = mockFetchContributors()
  const downloadPhotos = mockDownloadPhotos()

  create(name, { cwd: tmpDir, fetchContributors, downloadPhotos, title }, (err) => {
    t.ifError(err, 'no error creating new project')

    const expectedPath = Path.join(tmpDir, 'content', 'projects', `${name}.md`)
    const expectedContent = `
---
  title: "${title}"
---
    `.trim() + '\n'

    t.equals(Fs.readFileSync(expectedPath, 'utf8'), expectedContent, 'content file contents are correct')
    t.end()
  })
}))

test('should create data file', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = 'test-project'
  const fetchContributors = mockFetchContributors()
  const downloadPhotos = mockDownloadPhotos()

  create(name, { cwd: tmpDir, fetchContributors, downloadPhotos }, (err) => {
    t.ifError(err, 'no error creating new project')
    const expectedPath = Path.join(tmpDir, 'data', 'projects', `${name}.json`)
    t.doesNotThrow(() => Fs.accessSync(expectedPath, F_OK | R_OK), 'data file exists and can be read')
    t.end()
  })
}))

test('should write contributors to data file', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = 'test-project'
  const contributors = fakeContributors()
  const fetchContributors = mockFetchContributors(contributors)
  const downloadPhotos = mockDownloadPhotos()

  create(name, { cwd: tmpDir, fetchContributors, downloadPhotos }, (err) => {
    t.ifError(err, 'no error creating new project')

    const expectedPath = Path.join(tmpDir, 'data', 'projects', `${name}.json`)
    const expectedContent = JSON.stringify(contributors, null, 2)

    t.equals(Fs.readFileSync(expectedPath, 'utf8'), expectedContent, 'data file contents are correct')
    t.end()
  })
}))
