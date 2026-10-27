const { spawn } = require('child_process');

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--window-size=1536,1024',
    '--disable-gpu',
    'http://127.0.0.1:8000/'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9227/json/list');
  const tabs = await listRes.json();
  const tab = tabs.find(t => t.url.includes('8000'));
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  let id = 1;
  const send = (m, p={}) => new Promise(res => {
    const cur = id++;
    const h = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === cur) { ws.removeEventListener('message', h); res(d.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });

  ws.onopen = async () => {
    await send('Runtime.enable');
    await new Promise(r => setTimeout(r, 1500));
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.method === 'Runtime.exceptionThrown') console.error('EXCEPTION:', JSON.stringify(d.params.exceptionDetails, null, 2));
      if (d.method === 'Runtime.consoleAPICalled') console.log('LOG:', d.params.args.map(a => a.value));
    };

    console.log('Clicking Audit Trail...');
    const res = await send('Runtime.evaluate', {
      expression: `(() => {
        const buttons = Array.from(document.querySelectorAll('nav[aria-label="Sidebar Navigation"] button'));
        const auditBtn = buttons.find(b => b.innerText.includes('Audit Trail'));
        if (auditBtn) auditBtn.click();
        return {
          foundAuditBtn: !!auditBtn,
          buttonsFound: buttons.map(b => b.innerText.trim().replace(/\\n/g, ' '))
        };
      })()`,
      returnByValue: true
    });
    console.log('Audit click:', res.result.value);

    await new Promise(r => setTimeout(r, 800));

    const checkModal = await send('Runtime.evaluate', {
      expression: `(() => {
        const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.innerText);
        const hasImage2 = !!document.querySelector('div[style*="image2_backdrop.png"]');
        return { h3s, hasImage2 };
      })()`,
      returnByValue: true
    });
    console.log('Modal check after click:', checkModal.result.value);

    chrome.kill();
    process.exit(0);
  };
}
test();
