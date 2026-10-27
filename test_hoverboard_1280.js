const { spawn } = require('child_process');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9225',
  '--window-size=1280,900',
  '--disable-gpu',
  'http://127.0.0.1:8000/'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9225/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('8000'));
    if (!tab) { chrome.kill(); return; }

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      setTimeout(() => {
        // Click Applications button to open hoverboard
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              const appBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Applications'));
              if (appBtn) appBtn.click();
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
        fs.writeFileSync('C:\\hackthons\\test_hoverboard_1280.png', Buffer.from(data.result.data, 'base64'));
        console.log('Saved test_hoverboard_1280.png');
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
