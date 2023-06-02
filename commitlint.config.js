const czEmoji = require('./.cz-emoji')

const allowedTypes = czEmoji.types?.map((value) => {
  return value.name
})

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [0, 'always', 100],
    'type-enum': [2, 'always', allowedTypes],
  },
}
