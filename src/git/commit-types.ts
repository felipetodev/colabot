export const COMMIT_TYPES = {
  ai: {
    emoji: '🤖',
    description: 'Submit an AI commit message (ColaBOT)',
    release: false
  },
  feat: {
    emoji: '🆕',
    description: 'Add new feature',
    release: true // This will trigger a new release
  },
  fix: {
    emoji: '🐛',
    description: 'Submit a fix to a bug',
    release: true
  },
  perf: {
    emoji: '⚡️',
    description: 'Improve performance',
    release: true
  },
  refactor: {
    emoji: '🛠 ',
    description: 'Refactor code',
    release: true
  },
  docs: {
    emoji: '📚',
    description: 'Add or update documentation',
    release: false
  },
  test: {
    emoji: '🧪',
    description: 'Add or update tests',
    release: false
  },
  build: {
    emoji: '🏗️ ',
    description: 'Add or update build scripts',
    release: false
  },
  ci: {
    emoji: '🚦',
    description: 'Add or update CI/CD scripts',
    release: false
  },
  chore: {
    emoji: '🧹',
    description: 'Other changes that don\'t modify src or test files',
    release: false
  },
  revert: {
    emoji: '⏪',
    description: 'Revert to a commit',
    release: false
  }
}
