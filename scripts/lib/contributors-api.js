function fetchContributors (cb) {
  cb(null, [{name: 'one'}, {name: 'two'}])
}

module.exports.fetchContributors = fetchContributors
