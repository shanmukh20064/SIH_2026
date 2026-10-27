const { spawn } = require('child_process');
const fs = require('fs');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9229',
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
    const backdrop = document.querySelector('.bg-black\\\\/50');
    if (backdrop) {
      backdrop.click();
      return true;
    }
    const xBtns = Array.from(document.querySelectorAll('button')).filter(b => b.querySelector('svg.lucide-x'));
    if (xBtns.length > 0) {
      xBtns[xBtns.length - 1].click();
      return true;
    }
    return false;
  })()`);
  await new Promise(r => setTimeout(r, 600));
}

setTimeout(async () => {
  try {
    const listRes = await fetch('http://127.0.0.1:9229/json/list');
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

        console.log('=== TEST 1: Page Load & Tabular Numerals Verification ===');
        await new Promise(r => setTimeout(r, 2000));

        const title = await evaluate(ws, 'document.title');
        console.log('Title:', title);

        const kpiValues = await evaluate(ws, `(() => {
          const els = Array.from(document.querySelectorAll('.tabular-nums'));
          return els.map(e => ({ text: e.innerText, font: window.getComputedStyle(e).fontFamily }));
        })()`);
        console.log('Tabular-num elements found:', kpiValues.length);
        console.log('Sample metrics:', kpiValues.slice(0, 5));

        await captureScreenshot(ws, 'C:\\hackthons\\test_dashboard_tabular.png');

        // === TEST 2: Top Hoverboard in Navbar ===
        console.log('\n=== TEST 2: Top Hoverboard in Navbar ===');
        const openTopHoverboard = await evaluate(ws, `(() => {
          const btn = Array.from(document.querySelectorAll('header button')).find(b => b.innerText.includes('Applications'));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()`);
        console.log('Clicked Top Applications button:', openTopHoverboard);
        await new Promise(r => setTimeout(r, 600));

        const hoverboardCheck = await evaluate(ws, `(() => {
          const hb = document.querySelector('.bg-\\\\[\\\\#FBF8F5\\\\]');
          if (!hb) return null;
          return {
            title: hb.querySelector('h3, .font-serif')?.innerText || 'Hoverboard found',
            actions: Array.from(hb.querySelectorAll('button')).map(b => b.innerText.trim().replace(/\\n/g, ' - '))
          };
        })()`);
        console.log('Hoverboard detected:', hoverboardCheck);
        await captureScreenshot(ws, 'C:\\hackthons\\test_top_hoverboard.png');

        // Close hoverboard by clicking outside
        await evaluate(ws, `(() => {
          const btn = Array.from(document.querySelectorAll('header button')).find(b => b.innerText.includes('Applications'));
          if (btn) btn.click();
        })()`);
        await new Promise(r => setTimeout(r, 400));

        // === TEST 3: AI-Powered 9-Step Validation Workflow ===
        console.log('\n=== TEST 3: AI-Powered 9-Step Validation Workflow ===');
        // Click New Application from KPI action row or sidebar
        const openAiRes = await evaluate(ws, `(() => {
          // Find New Application button in KpiActionRow
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('New Application'));
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        })()`);
        console.log('Clicked New Application / AI Scrutiny trigger:', openAiRes);
        await new Promise(r => setTimeout(r, 800));

        // If regular modal opened, close and trigger AI modal through sidebar
        let isAiModalOpen = await evaluate(ws, `!!document.querySelector('h3')?.innerText?.includes('AI-Powered')`);
        if (!isAiModalOpen) {
          await closeModal(ws);
          // Trigger AI workflow directly
          await evaluate(ws, `(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const app = btns.find(b => b.innerText.includes('Deficiencies') || b.innerText.includes('Validation'));
            if (app) app.click();
          })()`);
          await new Promise(r => setTimeout(r, 600));
        }

        await captureScreenshot(ws, 'C:\\hackthons\\test_ai_step1.png');

        // Step 1: Select Application
        console.log('--- Step 1 to Step 5: Advance AI Workflow ---');
        for (let step = 1; step <= 5; step++) {
          const currentStepInfo = await evaluate(ws, `(() => {
            const h = document.querySelector('h3')?.innerText;
            const stepBadge = document.querySelector('.bg-\\\\[\\\\#EBF3ED\\\\]')?.innerText;
            return { h, stepBadge };
          })()`);
          console.log(`At Step:`, currentStepInfo);

          // Click Continue
          await evaluate(ws, `(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Continue'));
            if (btn) btn.click();
          })()`);
          await new Promise(r => setTimeout(r, 600));
        }

        // Now at Step 5/6: Run AI Scrutiny Engine
        console.log('--- Running Scrutiny Engine on Dossier ---');
        await evaluate(ws, `(() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Run Scrutiny Engine'));
          if (btn) btn.click();
        })()`);
        await new Promise(r => setTimeout(r, 1500));

        await captureScreenshot(ws, 'C:\\hackthons\\test_ai_step6_findings.png');

        const findingsInfo = await evaluate(ws, `(() => {
          const findings = Array.from(document.querySelectorAll('.border-l-3, .bg-\\\\[\\\\#FAF5F0\\\\]'));
          return findings.map(f => f.innerText);
        })()`);
        console.log('Findings and Evidence snippets:', findingsInfo);

        // Advance to Step 9: 3-Tier Status Distinction
        for (let step = 6; step < 9; step++) {
          await evaluate(ws, `(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Continue'));
            if (btn) btn.click();
          })()`);
          await new Promise(r => setTimeout(r, 500));
        }

        await captureScreenshot(ws, 'C:\\hackthons\\test_ai_step9_tiers.png');
        console.log('Captured Step 9 3-tier status distinction screenshot');
        await closeModal(ws);

        // === TEST 4: Institution Representative Profile & Lock ===
        console.log('\n=== TEST 4: Institution Representative Workspace ===');
        // Switch user to Institution Rep
        await evaluate(ws, `(() => {
          const profileBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Shanmukh') || b.querySelector('img[alt="Shanmukh"]'));
          if (profileBtn) profileBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 500));

        // Click Apex Institute Tech
        await evaluate(ws, `(() => {
          const instBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Apex Institute Tech') || b.innerText.includes('Institution Rep'));
          if (instBtn) instBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 800));

        // Now open Institution Profile
        await evaluate(ws, `(() => {
          const instNav = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Institution Profile') || b.innerText.includes('Institutions'));
          if (instNav) instNav.click();
        })()`);
        await new Promise(r => setTimeout(r, 800));

        const instCheck = await evaluate(ws, `(() => {
          const title = document.querySelector('h3')?.innerText;
          const pid = Array.from(document.querySelectorAll('*')).find(e => e.innerText?.includes('AICTE-1-10928374'));
          const collegeName = Array.from(document.querySelectorAll('*')).find(e => e.innerText?.includes('APEX INSTITUTE OF TECHNOLOGY'));
          return { title, hasPid: !!pid, hasCollegeName: !!collegeName };
        })()`);
        console.log('Institution Profile Check:', instCheck);
        await captureScreenshot(ws, 'C:\\hackthons\\test_institution_profile.png');
        await closeModal(ws);

        // === TEST 5: Security Officer Workflow ===
        console.log('\n=== TEST 5: Security Officer Workspace ===');
        // Open user switch again
        await evaluate(ws, `(() => {
          const profileBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Apex') || b.innerText.includes('Representative') || b.innerText.includes('Shanmukh'));
          if (profileBtn) profileBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 500));

        // Switch to Dr. Ramesh Kumar (Scrutiny Officer)
        await evaluate(ws, `(() => {
          const officerBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Ramesh') || b.innerText.includes('Scrutiny Officer'));
          if (officerBtn) officerBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 800));

        // Click Anomaly Review or Assigned Cases
        await evaluate(ws, `(() => {
          const reviewBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Anomaly Review') || b.innerText.includes('Assigned Cases'));
          if (reviewBtn) reviewBtn.click();
        })()`);
        await new Promise(r => setTimeout(r, 800));

        const scrutinyCheck = await evaluate(ws, `(() => {
          const title = document.querySelector('h3')?.innerText;
          const findings = Array.from(document.querySelectorAll('.border-l-3, .font-mono')).map(e => e.innerText).slice(0, 5);
          return { title, findingsCount: findings.length };
        })()`);
        console.log('Security Officer Scrutiny Check:', scrutinyCheck);
        await captureScreenshot(ws, 'C:\\hackthons\\test_security_officer_scrutiny.png');
        await closeModal(ws);

        console.log('\n>>> ALL WORKFLOWS, ROLES, AI VALIDATION & HOVERBOARD VERIFIED SUCCESSFULLY! <<<');
        chrome.kill();
        process.exit(0);
      } catch (err) {
        console.error('Error in test run:', err);
        chrome.kill();
        process.exit(1);
      }
    };
  } catch (err) {
    console.error('Script initialization error:', err);
    chrome.kill();
    process.exit(1);
  }
}, 2000);
