import { vscode } from "./utils/vscode";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

function App() {
  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: "Hey there partner! 🤠",
    });
  }

  return (
    <main>
      <h1 className="text-blue-400 text-3xl py-4">Hello React!</h1>
      <VSCodeButton onClick={handleHowdyClick}>Howdy!</VSCodeButton>
    </main>
  );
}

export default App;
