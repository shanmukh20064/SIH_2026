const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--disable-gpu',
  'http://127.0.0.1:8000/'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('8000'));
    if (!tab) {
      console.log('No tab found for 8000. All tabs:', tabs);
      chrome.kill();
      return;
    }
    
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
      ws.send(JSON.stringify({
        id: 3,
        method: 'Runtime.evaluate',
        params: { expression: 'document.body.innerHTML' }
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === 'Runtime.consoleAPICalled') {
        console.log('CONSOLE:', data.params.type, JSON.stringify(data.params.args));
      } else if (data.method === 'Runtime.exceptionThrown') {
        console.error('EXCEPTION:', JSON.stringify(data.params.exceptionDetails, null, 2));
      } else if (data.id === 3) {
        console.log('BODY INNER HTML (length):', data.result.result.value ? data.result.result.value.length : 0);
        console.log('BODY PREVIEW:', (data.result.result.value || '').substring(0, 300));
        chrome.kill();
        process.exit(0);
      }
    };

    setTimeout(() => {
      console.log('Timeout waiting for response');
      chrome.kill();
      process.exit(0);
    }, 4000);
  } catch (e) {
    console.error('Test error:', e);
    chrome.kill();
    process.exit(1);
  }
}, 2000);
