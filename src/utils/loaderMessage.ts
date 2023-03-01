import * as vscode from 'vscode';

export function loaderMessage(message: string) {
  const progressOptions: vscode.ProgressOptions = {
    location: vscode.ProgressLocation.Notification,
    title: message,
    cancellable: true,
  };
  vscode.window.withProgress(progressOptions, async (progress) => {
    progress.report({ message });
  });
}
