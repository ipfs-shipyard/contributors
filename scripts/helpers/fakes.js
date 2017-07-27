const Faker = require('faker')

function fakeContributors () {
  return Array(Faker.random.number({ min: 1, max: 10 })).fill(0).map(() => ({
    username: Faker.internet.userName(),
    url: Faker.internet.url(),
    photo: Faker.internet.avatar()
  }))
}

module.exports.fakeContributors = fakeContributors
