// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);

;(() => {
    const vscode = acquireVsCodeApi();
    const button = $('button');
    const content = $('#content').value;
    button.addEventListener("click", () => {
        console.log("Click 🦄");
        
        navigator.clipboard.writeText(content).then(() => {
            /* clipboard successfully set */
            vscode.postMessage({
                command: 'copy',
                text: content
            });
        }
        , function() {
            /* clipboard write failed */
            vscode.postMessage({
                command: 'copy',
                text: content
            });
        }
        );

    });
})();
