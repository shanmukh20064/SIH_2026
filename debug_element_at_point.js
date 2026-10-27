const { spawn } = require('child_process');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9227',
  '--window-size=1280,900',
  '--disable-gpu',
  'http://127.0.0.1:8000/'
]);

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9227/json/list');
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
            method: 'Runtime.evaluate',
            params: {
              expression: `
                // Find element at coordinate x=400, y=360 (where the green banner and hoverboard overlap)
                const el = document.elementFromPoint(400, 360);
                JSON.stringify({
                  tag: el?.tagName,
                  className: el?.className,
                  text: el?.textContent?.slice(0, 50),
                  headerZ: window.getComputedStyle(document.querySelector('header')).zIndex,
                  bannerZ: window.getComputedStyle(document.querySelector('.bg-gradient-to-r')).zIndex,
                  parentHierarchy: (() => {
                    let cur = el;
                    const path = [];
                    while (cur && cur !== document.body) {
                      path.push(cur.tagName + (cur.className ? '.' + cur.className.split(' ')[0] : ''));
                      cur = cur.parentElement;
                    }
                    return path;
                  })()
                }, null, 2);
              `
            }
          }));
        }, 600);
      }, 1500);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === 2 && data.result && data.result.result) {
        console.log('Element from point:', data.result.result.value);
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
