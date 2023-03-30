import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { vscode } from "../utils/vscode";

type Props = {
  language: string;
  value: string;
}

export default function CodeBlock ({ language, value }: Props) {
  const handleCopyClipboard = () => {
    vscode.postMessage({
      command: 'copyToClipboard',
      text: value || "",
    });
  }
  return (
    <div className="codeblock relative group/item">
      <div onClick={handleCopyClipboard} className='absolute invisible rounded-[0.3em] p-0.5 -top-2 right-3.5 group-hover/item:visible cursor-pointer bg-[var(--vscode-sideBar-background)]'>
        <svg className="h-5 w-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" transform="translate(3 3)">
            <path d="m11.5 9.5v-7c0-1.1045695-.8954305-2-2-2h-7c-1.1045695 0-2 .8954305-2 2v7c0 1.1045695.8954305 2 2 2h7c1.1045695 0 2-.8954305 2-2z"/>
            <path d="m3.5 11.5v1c0 1.1045695.8954305 2 2 2h7c1.1045695 0 2-.8954305 2-2v-7c0-1.1045695-.8954305-2-2-2h-1"/>
          </g>
        </svg>
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
