import { workspace } from 'vscode';
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const getWorkspaceFolder = (): string => {
  const { workspaceFolders } = workspace;
  return workspaceFolders ? workspaceFolders[0].uri.fsPath : '';
};

const excludeFromDiff = [
  'package-lock.json',
  'pnpm-lock.yaml',
  // yarn.lock, Cargo.lock, Gemfile.lock, Pipfile.lock, etc.
  '*.lock',
].map((file) => `:(exclude)${file}`);

const cleanStdout = (stdout: string) => stdout.trim().split('\n').filter(Boolean);

export async function getChangedFiles() {
  const { stdout } = await exec('git status --porcelain', { cwd: getWorkspaceFolder() });
  return cleanStdout(stdout).map((line) => line.split(' ').at(-1));
}

export async function getStagedDiff() {
  const diffCached = 'diff --cached';

  const { stdout: files } = await exec(
    `git ${diffCached} --name-only ${excludeFromDiff.join(' ')}`,
    { cwd: getWorkspaceFolder() }
  );

  const { stdout: diff } = await exec(`git ${diffCached} ${excludeFromDiff.join(' ')}`, {
    cwd: getWorkspaceFolder(),
  });

  return {
    files: cleanStdout(files),
    diff: diff,
  };
}

export async function gitCommit(commit: string) {
  const { stdout } = await exec(`git commit -m "${commit}"`, { cwd: getWorkspaceFolder() });
  return cleanStdout(stdout);
}
