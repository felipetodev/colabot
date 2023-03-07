import { window } from 'vscode';
import { gitCommit } from './';
import { COMMIT_TYPES } from './commit-types';

export function commitTypesOpts(withGitmoji: boolean, withSemVer: boolean) {
  if (withSemVer) {
    return Object.entries(COMMIT_TYPES).map(([key, val]) =>
      withGitmoji ? `${val.emoji} ${key}: ${val.description}` : `${key}: ${val.description}`
    );
  }

  return [
    withGitmoji
      ? `🤖 ai: ${COMMIT_TYPES.ai.description}`
      : `ai: ${COMMIT_TYPES.ai.description}`,
  ];
}

export function getCommitTypeObject({
  type,
  isAI,
  withGitmoji,
  commit,
}: {
  type: string
  isAI: boolean
  withGitmoji: boolean
  commit: string
}) {
  const { emoji, release } = COMMIT_TYPES[type as keyof typeof COMMIT_TYPES];

  if (isAI) {
    return {
      release,
      commit: `${withGitmoji ? emoji : ''} ${commit.trim()}`,
    };
  }

  return {
    release,
    commit: `${withGitmoji ? emoji : ''} ${type}: ${commit}`,
  };
}

const stagedError = 'No staged changes found. Please stage your changes before committing.';

export async function releaseCommit(commit: string, release: boolean) {
  if (release) {
    const isBreakingChange = await window.showInformationMessage(
      'Are there any breaking changes?',
      'No',
      'Yes'
    );

    if (isBreakingChange === 'No') {
      try {
        await gitCommit(commit);
        return window.showInformationMessage(`Commit created ✔: ${commit}`, { detail: '' });
      } catch (err) {
        window.showErrorMessage(stagedError);
        process.exit(0);
      }
    }

    if (isBreakingChange === 'Yes') {
      try {
        await gitCommit(`${commit} [breaking change]`);
        return window.showInformationMessage(`Commit created ✔: ${commit} [breaking change]`);
      } catch (err) {
        window.showErrorMessage(stagedError);
        process.exit(0);
      }
    }
  }

  try {
    await gitCommit(commit);
    return window.showInformationMessage(`Commit created ✔: ${commit}`);
  } catch (error) {
    window.showErrorMessage(stagedError);
    process.exit(0);
  }
}
