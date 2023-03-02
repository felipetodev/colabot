// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

const $ = (el) => document.querySelector(el);

;(() => {
  const vscode = acquireVsCodeApi();
  const clipboardBtn = $('#clipboard');
  const content = $('#content');

  clipboardBtn.addEventListener('click', () => {
    vscode.postMessage({
      type: 'copyToClipboard',
      command: 'copy',
      text: content.innerText,
    });
  });
})();
