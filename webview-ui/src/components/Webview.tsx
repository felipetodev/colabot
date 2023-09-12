import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { VSCodeMessageTypes } from '../types';
import { vscode } from '../utils/vscode';
import Clipboard from './Clipboard';

export default function CommandsWebview({ response }: { response: string }) {
  const handleCloseWebviewPanel = () => {
    vscode.postMessage({
      command: VSCodeMessageTypes.CloseWebviewPanel,
    });
  }
  return (
    <>
      <h1 className='text-blue-400 text-3xl font-bold'>
        Explain Code:
      </h1>
      <div className='py-5 overflow-hidden whitespace-pre-wrap overflow-ellipsis break-words'>
        {response || 'No response from AI provider'}
      </div>
      <VSCodeButton className='w-full' onClick={handleCloseWebviewPanel}>
        Close
      </VSCodeButton>
      <Clipboard content={response} />
    </>
  )
}
