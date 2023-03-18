import { useState } from 'react';
import { vscode } from './utils/vscode';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import Layout from './components/Layout';
import Clipboard from './components/Clipboard';
import Sidebar from './components/Sidebar';
import type { OpenAIStreamPayload } from './types';

declare global {
  interface Window {
    responseText?: string;
    sidebar?: boolean;
    openAIPayload?: OpenAIStreamPayload
  }
}

const ExplaiWebview = ({ response }: { response: string }) => {
  const handleCloseWebviewPanel = () => {
    vscode.postMessage({
      command: 'closeWebviewPanel',
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

function App() {
  const [aiResponse] = useState<string | undefined>(() => {
    if (window !== undefined) {
      return window?.responseText;
    }
  })
  const [sidebar] = useState<boolean | undefined>(() => {
    if (window !== undefined) {
      return window?.sidebar || false;
    }
  })

  return (
    <>
      {aiResponse && (
        <Layout>
          <ExplaiWebview response={aiResponse} />
        </Layout>
      )}
      {sidebar && <Sidebar />}
    </>
  );
}

export default App;
