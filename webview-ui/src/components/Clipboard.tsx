import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { vscode } from "../utils/vscode";
import { VSCodeMessageTypes } from "../types";

export default function Clipboard({ content }: { content?: string }) {
  const handleCopyClipboard = () => {
    vscode.postMessage({
      command: VSCodeMessageTypes.CopyToClipboard,
      text: content || "No response from AI provider",
    });
  }

  return (
    <VSCodeButton className="absolute top-5 right-4 rounded-md" onClick={handleCopyClipboard}>
      <svg className="h-5 w-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="translate(3 3)">
          <path d="m11.5 9.5v-7c0-1.1045695-.8954305-2-2-2h-7c-1.1045695 0-2 .8954305-2 2v7c0 1.1045695.8954305 2 2 2h7c1.1045695 0 2-.8954305 2-2z" />
          <path d="m3.5 11.5v1c0 1.1045695.8954305 2 2 2h7c1.1045695 0 2-.8954305 2-2v-7c0-1.1045695-.8954305-2-2-2h-1" />
        </g>
      </svg>
    </VSCodeButton>
  )
}
