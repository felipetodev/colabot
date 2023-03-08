import { useState } from "react";
import { vscode } from "./utils/vscode";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import Layout from "./components/Layout";
import Clipboard from "./components/Clipboard";

declare global {
  interface Window {
    responseText?: string;
  }
}

function App() {
  const [aiResponse] = useState<string | undefined>(() => {
    if (window !== undefined) {
      return window.responseText;
    }
  })

  const handleCloseWebviewPanel = () => {
    vscode.postMessage({
      command: "closeWebviewPanel",
    });
  }

  return (
    <Layout>
      <h1 className="text-blue-400 text-3xl font-bold">
        Explain Code:
      </h1>
      <div className="py-5 overflow-hidden whitespace-pre-wrap overflow-ellipsis break-words">
        {aiResponse || "No response from AI provider"}
      </div>
      <VSCodeButton className="w-full" onClick={handleCloseWebviewPanel}>
        Close
      </VSCodeButton>
      <Clipboard content={aiResponse} />
    </Layout>
  );
}

export default App;
