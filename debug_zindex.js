const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9226',
  '--window-size=1280,900',
  '--disable-gpu',
  'http://127.0.0.1:8000/'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9226/json/list');
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
              const header = document.querySelector('header');
              const banner = document.querySelector('.bg-gradient-to-r');
              const appBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Applications'));
              if (appBtn) appBtn.click();
              const hoverboard = document.querySelector('.animate-dropdown');
              JSON.stringify({
                headerClass: header?.className,
                headerZIndex: window.getComputedStyle(header).zIndex,
                headerPosition: window.getComputedStyle(header).position,
                bannerZIndex: window.getComputedStyle(banner).zIndex,
                bannerPosition: window.getComputedStyle(banner).position,
                hoverboardZIndex: hoverboard ? window.getComputedStyle(hoverboard).zIndex : null,
                hoverboardParentZ: hoverboard ? window.getComputedStyle(hoverboard.parentElement).zIndex : null,
              }, null, 2);
            `
          }
        }));
      }, 1500);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === 1 && data.result && data.result.result) {
        console.log('DOM info:', data.result.result.value);
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
