const { spawn } = require('child_process');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--window-size=1536,1024',
  '--disable-gpu',
  'http://127.0.0.1:8000/'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('8000'));
    if (!tab) {
      chrome.kill();
      return;
    }

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      // Wait for rendering then take screenshot
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 10,
          method: 'Page.captureScreenshot',
          params: { format: 'png' }
        }));
      }, 1500);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === 10 && data.result && data.result.data) {
        fs.writeFileSync('C:\\hackthons\\actual_rendered_dashboard.png', Buffer.from(data.result.data, 'base64'));
        console.log('Saved actual_rendered_dashboard.png');
        chrome.kill();
        process.exit(0);
      }
    };
  } catch (e) {
    console.error('Error:', e);
    chrome.kill();
    process.exit(1);
  }
}, 2000);
