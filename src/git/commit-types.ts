export const COMMIT_TYPES = {
  ai: {
    emoji: '๐ค',
    description: 'Submit an AI commit message (ColaBOT)',
    release: false
  },
  feat: {
    emoji: '๐',
    description: 'Add new feature',
    release: true // This will trigger a new release
  },
  fix: {
    emoji: '๐',
    description: 'Submit a fix to a bug',
    release: true
  },
  perf: {
    emoji: 'โก๏ธ',
    description: 'Improve performance',
    release: true
  },
  refactor: {
    emoji: '๐  ',
    description: 'Refactor code',
    release: true
  },
  docs: {
    emoji: '๐',
    description: 'Add or update documentation',
    release: false
  },
  test: {
    emoji: '๐งช',
    description: 'Add or update tests',
    release: false
  },
  build: {
    emoji: '๐๏ธ ',
    description: 'Add or update build scripts',
    release: false
  },
  ci: {
    emoji: '๐ฆ',
    description: 'Add or update CI/CD scripts',
    release: false
  },
  chore: {
    emoji: '๐งน',
    description: 'Other changes that don\'t modify src or test files',
    release: false
  },
  revert: {
    emoji: 'โช',
    description: 'Revert to a commit',
    release: false
  }
}
