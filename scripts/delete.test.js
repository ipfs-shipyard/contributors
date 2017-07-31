const test = require('tape')
const Faker = require('faker')
const Fs = require('fs')
const { F_OK } = Fs.constants
const Path = require('path')
const create = require('./create')
const del = require('./delete')
const { withTmpDir } = require('./helpers/tmpdir')
const { mockFetchContributors, mockDownloadPhotos } = require('./helpers/mocks')

test('should delete an existing project', withTmpDir((t, tmpDir) => {
  t.plan(8)

  const name = Faker.internet.userName()
  const fetchContributors = mockFetchContributors()
  const downloadPhotos = mockDownloadPhotos()

  create(name, { cwd: tmpDir, fetchContributors, downloadPhotos }, (err) => {
    t.ifError(err, 'no error creating project')

    const contentFilePath = Path.join(tmpDir, 'content', 'projects', `${name}.md`)
    const dataFilePath = Path.join(tmpDir, 'data', 'projects', `${name}.json`)
    const imagesDir = Path.join(tmpDir, 'static', 'images', `${name}`)

    t.doesNotThrow(() => Fs.accessSync(contentFilePath, F_OK), 'content file exists')
    t.doesNotThrow(() => Fs.accessSync(dataFilePath, F_OK), 'data file exists')
    t.doesNotThrow(() => Fs.accessSync(imagesDir, F_OK), 'images directory exists')

    del(name, { cwd: tmpDir }, (err) => {
      t.ifError(err, 'no error deleting project')
      t.throws(() => Fs.accessSync(contentFilePath, F_OK), 'content file does not exist')
      t.throws(() => Fs.accessSync(dataFilePath, F_OK), 'data file does not exist')
      t.throws(() => Fs.accessSync(imagesDir, F_OK), 'images directory does not exist')
      t.end()
    })
  })
}))
