const test = require('tape')
const Fs = require('fs')
const Path = require('path')
const Faker = require('faker')
const Yaml = require('yamljs')
const { withTmpDir } = require('../helpers/tmpdir')
const { withContributorsServer } = require('../helpers/fixtures')
const { fetchContributors, writeDataFile, writeContentFile } = require('./contributors')

test('should fetch contributors', withContributorsServer((t, server) => {
  t.plan(3)

  const { port, address, family } = server.address()
  const host = family === 'IPv6' ? `[${address}]` : address
  const endpoint = `http://${host}:${port}/all.json`

  fetchContributors({ endpoint }, (err, contributors) => {
    t.ifError(err, 'no error updating file')
    t.ok(contributors, 'contributors data returned')
    t.ok(Array.isArray(contributors), 'contributors data is an array')
    server.close()
    t.end()
  })
}))

test('should error on non 200 status code while fetch contributors', withContributorsServer((t, server) => {
  t.plan(1)

  const { port, address, family } = server.address()
  const host = family === 'IPv6' ? `[${address}]` : address
  const endpoint = `http://${host}:${port}/${Date.now()}.json`

  fetchContributors({ endpoint }, (err, contributors) => {
    t.ok(err, 'expected error fetching contributors')
    server.close()
    t.end()
  })
}))

test('should write data file', withTmpDir((t, tmpDir) => {
  t.plan(7)

  const name = Faker.internet.userName()
  const username = Faker.internet.userName()
  const contributors = [{ username, photo: Faker.image.imageUrl() }]
  const photos = { big: [`/images/${name}/${username}@500.png`], small: [`/images/${name}/${username}@250.png`] }
  const config = { photoSizeBig: 500, photoSizeSmall: 250 }

  writeDataFile(tmpDir, name, contributors, photos, config, (err) => {
    t.ifError(err, 'no error updating file')

    const expectedPath = Path.join(tmpDir, `${name}.json`)
    const dataFileContent = JSON.parse(Fs.readFileSync(expectedPath))

    t.equal(dataFileContent.contributors.length, 1, 'contributor added to data file')

    const dataFileContributor = dataFileContent.contributors[0]

    t.equal(dataFileContributor.username, dataFileContributor.username, 'username correct')
    t.equal(dataFileContributor.photo.big, photos.big[0], 'big photo correct')
    t.equal(dataFileContributor.photo.small, photos.small[0], 'small photo correct')

    t.equal(dataFileContent.config.photoSizeBig, config.photoSizeBig, 'big photo size in file')
    t.equal(dataFileContent.config.photoSizeSmall, config.photoSizeSmall, 'small photo size in file')

    t.end()
  })
}))

test('should write content file', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = Faker.internet.userName()
  const title = Faker.company.companyName()

  writeContentFile(tmpDir, name, { title }, (err) => {
    t.ifError(err, 'no error writing content file')

    const expectedPath = Path.join(tmpDir, `${name}.md`)
    const expectedContent = Yaml.load(expectedPath)

    t.equals(expectedContent.title, title, 'content file contents are correct')
    t.end()
  })
}))

test('should write empty content file if no data', withTmpDir((t, tmpDir) => {
  t.plan(2)

  const name = Faker.internet.userName()

  writeContentFile(tmpDir, name, null, (err) => {
    t.ifError(err, 'no error writing content file')

    const expectedPath = Path.join(tmpDir, `${name}.md`)
    const expectedContent = Fs.readFileSync(expectedPath, 'utf8')

    t.equals(expectedContent, '', 'content file contents are correct')
    t.end()
  })
}))
