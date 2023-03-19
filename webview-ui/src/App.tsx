import { useState } from 'react';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import CommandsWebview from './components/Webview';

function App() {
  const [aiResponse] = useState<string | undefined>(() => {
    if (window !== undefined) {
      return window?.responseText;
    }
  })
  const [sidebar] = useState<boolean>(() => {
    if (window !== undefined) {
      return window?.sidebar ?? false;
    }
    return false
  })

  return (
    <>
      {aiResponse && (
        <Layout>
          <CommandsWebview response={aiResponse} />
        </Layout>
      )}
      {sidebar && <Sidebar />}
    </>
  );
}

export default App;
