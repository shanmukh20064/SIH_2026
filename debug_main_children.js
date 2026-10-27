const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9228',
  '--window-size=1280,900',
  '--disable-gpu',
  'http://127.0.0.1:8000/'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9228/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('8000'));
    if (!tab) { chrome.kill(); return; }

    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    ws.onopen = () => {
      setTimeout(() => {
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.evaluate',
          params: {
            expression: `
              const main = document.querySelector('main');
              const children = Array.from(main.children).map(c => {
                const s = window.getComputedStyle(c);
                return {
                  tag: c.tagName,
                  class: c.className.slice(0, 30),
                  position: s.position,
                  zIndex: s.zIndex,
                  opacity: s.opacity,
                  transform: s.transform,
                  filter: s.filter,
                  isolation: s.isolation
                };
              });
              JSON.stringify(children, null, 2);
            `
          }
        }));
      }, 1500);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === 1 && data.result && data.result.result) {
        console.log('Main children styles:', data.result.result.value);
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
