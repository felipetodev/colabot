import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { vscode } from "../utils/vscode";
import { VSCodeMessageTypes } from '../types';

type Props = {
  language: string;
  value: string;
}

export default function CodeBlock({ language, value }: Props) {
  const handleCopyClipboard = () => {
    vscode.postMessage({
      command: VSCodeMessageTypes.CopyToClipboard,
      text: value || "",
    });
  }
  const handleReplaceCode = () => {
    vscode.postMessage({
      command: VSCodeMessageTypes.ReplaceSelectedCode,
      text: value,
    });
  }
  return (
    <div className="codeblock relative group/item rounded-[4px]">
      <div className='flex absolute invisible rounded-[0.3em] p-0.5 -top-2 right-3.5 group-hover/item:visible cursor-pointer bg-[var(--vscode-sideBar-background)] border border-[var(--vscode-chat-requestBorder)]'>
        <button title='Copy' onClick={handleCopyClipboard}>
          <svg className="h-5 w-5 hover:opacity-70" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="translate(3 3)">
              <path d="m11.5 9.5v-7c0-1.1045695-.8954305-2-2-2h-7c-1.1045695 0-2 .8954305-2 2v7c0 1.1045695.8954305 2 2 2h7c1.1045695 0 2-.8954305 2-2z" />
              <path d="m3.5 11.5v1c0 1.1045695.8954305 2 2 2h7c1.1045695 0 2-.8954305 2-2v-7c0-1.1045695-.8954305-2-2-2h-1" />
            </g>
          </svg>
        </button>
        <button title='Replace' onClick={handleReplaceCode}>
          <svg className='hover:opacity-70' height="21" viewBox="0 0 21 21" width="21" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(4 3)">
              <path d="m3.5 1.5c-.44119105-.00021714-1.03893772-.0044496-1.99754087-.00501204-.51283429-.00116132-.93645365.3838383-.99544161.88103343l-.00701752.11906336v10.99753785c.00061498.5520447.44795562.9996604 1 1.0006148l10 .0061982c.5128356.0008356.9357441-.3849039.993815-.882204l.006185-.1172316v-11c0-.55228475-.4477152-1-1-1-.8704853-.00042798-1.56475733.00021399-2 0" />
              <path d="m4.5.5h4c.55228475 0 1 .44771525 1 1s-.44771525 1-1 1h-4c-.55228475 0-1-.44771525-1-1s.44771525-1 1-1z" />
              <path d="m2.5 5.5h5" />
              <path d="m2.5 7.5h7" />
              <path d="m2.5 9.5h3" />
              <path d="m2.5 11.5h6" />
            </g>
          </svg>
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0 }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  )
}
