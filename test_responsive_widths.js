const { spawn } = require('child_process');
const fs = require('fs');

async function testWidth(width, filename) {
  return new Promise((resolve, reject) => {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless=new',
      `--remote-debugging-port=${9300 + Math.floor(Math.random() * 100)}`,
      `--window-size=${width},900`,
      '--disable-gpu',
      'http://127.0.0.1:8000/'
    ]);

    setTimeout(async () => {
      try {
        const portMatch = chrome.spawnargs.find(a => a.includes('--remote-debugging-port='));
        const port = portMatch.split('=')[1];
        const listRes = await fetch(`http://127.0.0.1:${port}/json/list`);
        const tabs = await listRes.json();
        const tab = tabs.find(t => t.url.includes('8000'));
        if (!tab) { chrome.kill(); return resolve(); }

        const ws = new WebSocket(tab.webSocketDebuggerUrl);
        ws.onopen = () => {
          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 1,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 1200);
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === 1 && data.result && data.result.data) {
            fs.writeFileSync(`C:\\hackthons\\${filename}`, Buffer.from(data.result.data, 'base64'));
            console.log(`Saved ${filename} at width ${width}`);
            chrome.kill();
            resolve();
          }
        };
      } catch (e) {
        chrome.kill();
        reject(e);
      }
    }, 2000);
  });
}

(async () => {
  await testWidth(1366, 'test_width_1366.png');
  await testWidth(1280, 'test_width_1280.png');
  console.log('All responsive tests done');
})();
