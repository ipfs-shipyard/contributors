const test = require('tape')
const Fs = require('fs')
const { F_OK, R_OK } = Fs.constants
const Faker = require('faker')
const Yaml = require('yamljs')
const create = require('./create')
const { getContentFilePath, getDataFilePath } = require('./lib/contributors')
const { withTmpDir } = require('./helpers/tmpdir')
const { mockFetchContributors, mockDownloadPhotos } = require('./helpers/mocks')

test('should require project name', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = ''
  const fetchContributors = mockFetchContributors()
  const downloadPhotos = mockDownloadPhotos()

  create(name, { projectDir: tmpDir, fetchContributors, downloadPhotos }, (err) => {
    t.ok(err, 'expected error creating new project')
    t.equals(err.message, 'Project name is required', 'correct error was raised')
    t.end()
  })
}))

test('should not create if content file exists', withTmpDir((t, tmpDir) => {
  t.plan(4)

  const name = Faker.internet.userName()
  const fetchContributors = mockFetchContributors()
  const downloadPhotos = mockDownloadPhotos()

  create(name, { projectDir: tmpDir, fetchContributors, downloadPhotos }, (err) => {
    t.ifError(err, 'no error creating new project')
    const expectedPath = getContentFilePath(tmpDir, name)
    t.doesNotThrow(() => Fs.accessSync(expectedPath, F_OK | R_OK), 'content file exists and can be read')

    create(name, { projectDir: tmpDir, fetchContributors, downloadPhotos }, (err) => {
      t.ok(err, 'error was rasied creating project that already exists')
      t.equals(err.message, `Project "${name}" already exists in ${tmpDir}`, 'correct error was raised')
      t.end()
    })
  })
}))

test('should create content file in correct location', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = Faker.internet.userName()
  const fetchContributors = mockFetchContributors()
  const downloadPhotos = mockDownloadPhotos()

  create(name, { projectDir: tmpDir, fetchContributors, downloadPhotos }, (err) => {
    t.ifError(err, 'no error creating new project')
    const expectedPath = getContentFilePath(tmpDir, name)
    t.doesNotThrow(() => Fs.accessSync(expectedPath, F_OK | R_OK), 'content file exists and can be read')
    t.end()
  })
}))

test('should default content file title to project name if not defined', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = Faker.internet.userName()
  const fetchContributors = mockFetchContributors()
  const downloadPhotos = mockDownloadPhotos()

  create(name, { projectDir: tmpDir, fetchContributors, downloadPhotos }, (err) => {
    t.ifError(err, 'no error creating new project')

    const expectedPath = getContentFilePath(tmpDir, name)
    const expectedContent = Yaml.load(expectedPath)

    t.equals(expectedContent.title, name, 'content file contents are correct')
    t.end()
  })
}))

test('should set content file title if specified', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = Faker.internet.userName()
  const title = Faker.company.companyName()
  const fetchContributors = mockFetchContributors()
  const downloadPhotos = mockDownloadPhotos()

  create(name, { projectDir: tmpDir, fetchContributors, downloadPhotos, title }, (err) => {
    t.ifError(err, 'no error creating new project')

    const expectedPath = getContentFilePath(tmpDir, name)
    const expectedContent = Yaml.load(expectedPath)

    t.equals(expectedContent.title, title, 'content file contents are correct')
    t.end()
  })
}))

test('should create data file in correct location', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = Faker.internet.userName()
  const fetchContributors = mockFetchContributors()
  const downloadPhotos = mockDownloadPhotos()

  create(name, { projectDir: tmpDir, fetchContributors, downloadPhotos }, (err) => {
    t.ifError(err, 'no error creating new project')
    const expectedPath = getDataFilePath(tmpDir, name)
    t.doesNotThrow(() => Fs.accessSync(expectedPath, F_OK | R_OK), 'data file exists and can be read')
    t.end()
  })
}))
