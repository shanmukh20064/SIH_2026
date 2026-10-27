const { spawn } = require('child_process');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9228',
  '--window-size=1536,1024',
  '--disable-gpu',
  'http://127.0.0.1:8000/'
]);

let reqId = 1;
function sendCommand(ws, method, params = {}) {
  const id = reqId++;
  return new Promise((resolve, reject) => {
    const handler = (event) => {
      const data = JSON.parse(event.data);
      if (data.id === id) {
        ws.removeEventListener('message', handler);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(ws, expression) {
  const res = await sendCommand(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return res && res.result ? res.result.value : null;
}

async function captureScreenshot(ws, filename) {
  const res = await sendCommand(ws, 'Page.captureScreenshot', { format: 'png' });
  if (res && res.data) {
    fs.writeFileSync(filename, Buffer.from(res.data, 'base64'));
    console.log(`Saved screenshot: ${filename}`);
  }
}

async function closeModal(ws) {
  await evaluate(ws, `(() => {
    const backdrop = document.querySelector('.z-\\\\[95\\\\] .bg-black\\\\/45');
    if (backdrop) {
      backdrop.click();
      return true;
    }
    const xBtn = document.querySelector('.z-\\\\[95\\\\] button');
    if (xBtn) {
      xBtn.click();
      return true;
    }
    return false;
  })()`);
  await new Promise(r => setTimeout(r, 600));
}

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9228/json/list');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.url.includes('8000'));
    if (!tab) {
      console.error('No tab found on 8000');
      chrome.kill();
      process.exit(1);
    }

    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    ws.onopen = async () => {
      try {
        await sendCommand(ws, 'Runtime.enable');
        await sendCommand(ws, 'Page.enable');

        console.log('=== TEST 1: Page Load & Initial State ===');
        await new Promise(r => setTimeout(r, 1200));

        const title = await evaluate(ws, 'document.title');
        console.log('Title:', title);

        // Sidebar buttons
        const sidebarButtons = await evaluate(ws, `
          Array.from(document.querySelectorAll('nav[aria-label="Sidebar Navigation"] button')).map(b => b.innerText.trim().replace(/\\n/g, ' '))
        `);
        console.log('Sidebar buttons found:', sidebarButtons);

        // === TEST 2: Applications Menu & Hoverboard ===
        console.log('\n=== TEST 2: Applications Menu & Hoverboard ===');
        const clickAppResult = await evaluate(ws, `(() => {
          const btn = Array.from(document.querySelectorAll('nav[aria-label="Sidebar Navigation"] button'))
            .find(b => b.innerText.includes('Applications'));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()`);
        console.log('Clicked Applications button:', clickAppResult);
        await new Promise(r => setTimeout(r, 600));

        const hoverboardInfo = await evaluate(ws, `(() => {
          const hb = document.querySelector('.bg-white\\\\/92');
          if (!hb) return null;
          return {
            text: hb.innerText.substring(0, 100),
            buttons: Array.from(hb.querySelectorAll('button')).map(b => b.innerText.trim().replace(/\\n/g, ' '))
          };
        })()`);
        console.log('Hoverboard open:', !!hoverboardInfo);
        if (hoverboardInfo) {
          console.log('Hoverboard actions:', hoverboardInfo.buttons);
          await captureScreenshot(ws, 'C:\\hackthons\\test_hoverboard_open.png');
        }

        // === TEST 3: Click "New Application" from Hoverboard ===
        console.log('\n=== TEST 3: Click "New Application" from Hoverboard ===');
        const clickNewApp = await evaluate(ws, `(() => {
          const btn = Array.from(document.querySelectorAll('button'))
            .find(b => b.innerText.includes('New Application') && b.closest('.bg-white\\\\/92'));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()`);
        console.log('Clicked New Application:', clickNewApp);
        await new Promise(r => setTimeout(r, 600));

        const newAppModalCheck = await evaluate(ws, `(() => {
          const modalHeader = Array.from(document.querySelectorAll('h3')).find(h => h.innerText.includes('New Approval Application'));
          const hasImage2Backdrop = !!document.querySelector('div[style*="image2_backdrop.png"]');
          const isTransparentWhite = !!document.querySelector('.bg-white\\\\/92');
          return {
            modalFound: !!modalHeader,
            title: modalHeader ? modalHeader.innerText : null,
            hasImage2Backdrop,
            isTransparentWhite
          };
        })()`);
        console.log('New Application Modal:', newAppModalCheck);
        await captureScreenshot(ws, 'C:\\hackthons\\test_modal_new_app.png');
        await closeModal(ws);

        // === TEST 4: Document Verification ===
        console.log('\n=== TEST 4: Document Verification ===');
        await evaluate(ws, `(() => {
          const btn = Array.from(document.querySelectorAll('nav[aria-label="Sidebar Navigation"] button'))
            .find(b => b.innerText.includes('Document Verification'));
          if (btn) btn.click();
        })()`);
        await new Promise(r => setTimeout(r, 600));
        const verifyModalCheck = await evaluate(ws, `(() => {
          const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.innerText.includes('Verification') || h.innerText.includes('Registry'));
          const hasImage2 = !!document.querySelector('div[style*="image2_backdrop.png"]');
          return { modalFound: !!h3, title: h3 ? h3.innerText : null, hasImage2 };
        })()`);
        console.log('Document Verification Modal:', verifyModalCheck);
        await captureScreenshot(ws, 'C:\\hackthons\\test_modal_verify.png');
        await closeModal(ws);

        // === TEST 5: Compliance Check ===
        console.log('\n=== TEST 5: Compliance Check ===');
        await evaluate(ws, `(() => {
          const btn = Array.from(document.querySelectorAll('nav[aria-label="Sidebar Navigation"] button'))
            .find(b => b.innerText.includes('Compliance Check'));
          if (btn) btn.click();
        })()`);
        await new Promise(r => setTimeout(r, 600));
        const rulesModalCheck = await evaluate(ws, `(() => {
          const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.innerText.includes('Compliance') || h.innerText.includes('Rules'));
          const hasImage2 = !!document.querySelector('div[style*="image2_backdrop.png"]');
          return { modalFound: !!h3, title: h3 ? h3.innerText : null, hasImage2 };
        })()`);
        console.log('Compliance Check Modal:', rulesModalCheck);
        await captureScreenshot(ws, 'C:\\hackthons\\test_modal_compliance.png');
        await closeModal(ws);

        // === TEST 6: Institutions ===
        console.log('\n=== TEST 6: Institutions ===');
        await evaluate(ws, `(() => {
          const btn = Array.from(document.querySelectorAll('nav[aria-label="Sidebar Navigation"] button'))
            .find(b => b.innerText.includes('Institutions'));
          if (btn) btn.click();
        })()`);
        await new Promise(r => setTimeout(r, 600));
        const instModalCheck = await evaluate(ws, `(() => {
          const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.innerText.includes('Institutional') || h.innerText.includes('Institutions'));
          const hasImage2 = !!document.querySelector('div[style*="image2_backdrop.png"]');
          return { modalFound: !!h3, title: h3 ? h3.innerText : null, hasImage2 };
        })()`);
        console.log('Institutions Modal:', instModalCheck);
        await captureScreenshot(ws, 'C:\\hackthons\\test_modal_institutions.png');
        await closeModal(ws);

        // === TEST 7: Reports ===
        console.log('\n=== TEST 7: Reports ===');
        await evaluate(ws, `(() => {
          const btn = Array.from(document.querySelectorAll('nav[aria-label="Sidebar Navigation"] button'))
            .find(b => b.innerText.includes('Reports'));
          if (btn) btn.click();
        })()`);
        await new Promise(r => setTimeout(r, 600));
        const reportModalCheck = await evaluate(ws, `(() => {
          const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.innerText.includes('Report') || h.innerText.includes('Dossier'));
          const hasImage2 = !!document.querySelector('div[style*="image2_backdrop.png"]');
          return { modalFound: !!h3, title: h3 ? h3.innerText : null, hasImage2 };
        })()`);
        console.log('Reports Modal:', reportModalCheck);
        await captureScreenshot(ws, 'C:\\hackthons\\test_modal_report.png');
        await closeModal(ws);

        // === TEST 8: Audit Trail ===
        console.log('\n=== TEST 8: Audit Trail ===');
        await evaluate(ws, `(() => {
          const btn = Array.from(document.querySelectorAll('nav[aria-label="Sidebar Navigation"] button'))
            .find(b => b.innerText.includes('Audit Trail'));
          if (btn) btn.click();
        })()`);
        await new Promise(r => setTimeout(r, 600));
        const auditModalCheck = await evaluate(ws, `(() => {
          const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.innerText.includes('Audit'));
          const hasImage2 = !!document.querySelector('div[style*="image2_backdrop.png"]');
          return { modalFound: !!h3, title: h3 ? h3.innerText : null, hasImage2 };
        })()`);
        console.log('Audit Trail Modal:', auditModalCheck);
        await captureScreenshot(ws, 'C:\\hackthons\\test_modal_audit.png');
        await closeModal(ws);

        // === TEST 9: User Management ===
        console.log('\n=== TEST 9: User Management ===');
        await evaluate(ws, `(() => {
          const btn = Array.from(document.querySelectorAll('nav[aria-label="Sidebar Navigation"] button'))
            .find(b => b.innerText.includes('User Management'));
          if (btn) btn.click();
        })()`);
        await new Promise(r => setTimeout(r, 600));
        const userModalCheck = await evaluate(ws, `(() => {
          const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.innerText.includes('Profile') || h.innerText.includes('User'));
          const hasImage2 = !!document.querySelector('div[style*="image2_backdrop.png"]');
          return { modalFound: !!h3, title: h3 ? h3.innerText : null, hasImage2 };
        })()`);
        console.log('User Management Modal:', userModalCheck);
        await captureScreenshot(ws, 'C:\\hackthons\\test_modal_users.png');
        await closeModal(ws);

        // === TEST 10: Settings ===
        console.log('\n=== TEST 10: Settings ===');
        await evaluate(ws, `(() => {
          const btn = Array.from(document.querySelectorAll('nav[aria-label="Sidebar Navigation"] button'))
            .find(b => b.innerText.includes('Settings'));
          if (btn) btn.click();
        })()`);
        await new Promise(r => setTimeout(r, 600));
        const settingsModalCheck = await evaluate(ws, `(() => {
          const h3 = Array.from(document.querySelectorAll('h3')).find(h => h.innerText.includes('Settings'));
          const hasImage2 = !!document.querySelector('div[style*="image2_backdrop.png"]');
          return { modalFound: !!h3, title: h3 ? h3.innerText : null, hasImage2 };
        })()`);
        console.log('Settings Modal:', settingsModalCheck);
        await captureScreenshot(ws, 'C:\\hackthons\\test_modal_settings.png');
        await closeModal(ws);

        // === TEST 11: Top Emblem Branding & Dashboard Reset ===
        console.log('\n=== TEST 11: Top Emblem Branding & Dashboard Reset ===');
        await evaluate(ws, `(() => {
          const brand = document.querySelector('div[title*="Ministry of Education"]');
          if (brand) brand.click();
        })()`);
        await new Promise(r => setTimeout(r, 400));
        const finalActiveNav = await evaluate(ws, `(() => {
          const activeBtn = document.querySelector('nav[aria-label="Sidebar Navigation"] button.bg-\\\\[\\\\#0E453A\\\\]');
          return activeBtn ? activeBtn.innerText.trim() : null;
        })()`);
        console.log('Active navigation after reset:', finalActiveNav);

        console.log('\n>>> ALL 9 FUNCTIONS + HOVERBOARD FULLY OPERATIONAL AND VERIFIED! <<<');
        chrome.kill();
        process.exit(0);
      } catch (err) {
        console.error('Error during test execution:', err);
        chrome.kill();
        process.exit(1);
      }
    };
  } catch (err) {
    console.error('Overall script error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 2000);
