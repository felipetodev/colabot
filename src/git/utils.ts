import { window } from 'vscode';
import { gitCommit } from './';
import { COMMIT_TYPES } from './commit-types';

export function commitTypesOpts(withGitmoji: boolean) {
  return Object.entries(COMMIT_TYPES).map(([key, val]) =>
    withGitmoji ? `${val.emoji} ${key}: ${val.description}` : `${key}: ${val.description}`
  );
}

export function getCommitTypeObject({
  type,
  isIA,
  withGitmoji,
  commit,
}: {
  type: string
  isIA: boolean
  withGitmoji: boolean
  commit: string
}) {
  const { emoji, release } = COMMIT_TYPES[type as keyof typeof COMMIT_TYPES];

  if (isIA) {
    return {
      release,
      commit: `${withGitmoji ? emoji : ''} ${commit.trim()}`,
    };
  } else {
    return {
      release,
      commit: `${withGitmoji ? emoji : ''} ${type}: ${commit}`,
    };
  }
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
        return window.showInformationMessage(`Commit created ✔: ${commit} [breaking change] ✔`);
      } catch (err) {
        window.showErrorMessage(stagedError);
        process.exit(0);
      }
    }
  }

  return await gitCommit(commit);
}
