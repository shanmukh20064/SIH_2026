const { spawn } = require('child_process');
const fs = require('fs');

async function captureRole(username, roleName, outputFile) {
  return new Promise((resolve, reject) => {
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
        if (!tab) {
          chrome.kill();
          return resolve();
        }

        const ws = new WebSocket(tab.webSocketDebuggerUrl);
        ws.onopen = () => {
          // Set localStorage to switch user role and reload
          const script = `
            localStorage.setItem('aicte_user', JSON.stringify({
              name: '${roleName}',
              role: '${username === 'reviewer' ? 'Security Officer' : 'Institution Rep'}',
              username: '${username}',
              avatar: '${username === 'reviewer' ? 'R' : 'A'}'
            }));
            window.location.reload();
          `;
          ws.send(JSON.stringify({
            id: 1,
            method: 'Runtime.evaluate',
            params: { expression: script }
          }));

          setTimeout(() => {
            ws.send(JSON.stringify({
              id: 10,
              method: 'Page.captureScreenshot',
              params: { format: 'png' }
            }));
          }, 2000);
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === 10 && data.result && data.result.data) {
            fs.writeFileSync(outputFile, Buffer.from(data.result.data, 'base64'));
            console.log(`Saved ${outputFile}`);
            chrome.kill();
            resolve();
          }
        };
      } catch (e) {
        console.error('Error:', e);
        chrome.kill();
        resolve();
      }
    }, 2000);
  });
}

(async () => {
  await captureRole('reviewer', 'Dr. Ramesh Kumar', 'C:\\hackthons\\security_officer_dashboard.png');
  await captureRole('institution', 'Apex Institute Tech', 'C:\\hackthons\\institution_dashboard.png');
  process.exit(0);
})();
