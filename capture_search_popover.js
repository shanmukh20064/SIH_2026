const { spawn } = require('child_process');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9223',
  '--window-size=1536,1024',
  '--disable-gpu',
  'http://127.0.0.1:8000/'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9223/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('8000'));
    if (!tab) { chrome.kill(); return; }

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      setTimeout(() => {
        // Find search button and click it
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              const searchBtn = document.querySelector('button[title*="Search"]:not([disabled])');
              if (searchBtn) {
                searchBtn.click();
                'clicked search button';
              } else {
                'search button not found';
              }
            `
          }
        }));

        setTimeout(() => {
          ws.send(JSON.stringify({
            id: 2,
            method: 'Page.captureScreenshot',
            params: { format: 'png' }
          }));
        }, 800);
      }, 1500);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === 2 && data.result && data.result.data) {
        fs.writeFileSync('C:\\hackthons\\search_popover_opened.png', Buffer.from(data.result.data, 'base64'));
        console.log('Saved search_popover_opened.png');
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
