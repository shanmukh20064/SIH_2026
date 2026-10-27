const { spawn } = require('child_process');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9229',
  '--window-size=1280,900',
  '--disable-gpu',
  'http://127.0.0.1:8000/'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9229/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('8000'));
    if (!tab) { chrome.kill(); return; }

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      setTimeout(() => {
        // Find the Applications button specifically inside the TOP HEADER NAV
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              const topAppBtn = document.querySelector('header nav div button');
              if (topAppBtn) {
                topAppBtn.click();
                'clicked top navbar Applications button';
              } else {
                'topAppBtn not found';
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
        fs.writeFileSync('C:\\hackthons\\test_top_navbar_hoverboard.png', Buffer.from(data.result.data, 'base64'));
        console.log('Saved test_top_navbar_hoverboard.png');
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
