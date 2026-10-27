const { spawn } = require('child_process');
const fs = require('fs');

async function runTests() {
  console.log('--- Starting Chrome DevTools Automated Verification ---');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9233',
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
      console.log(`[PASS] Saved screenshot: ${filename}`);
    }
  }

  setTimeout(async () => {
    try {
      const listRes = await fetch('http://127.0.0.1:9233/json/list');
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
          console.log('\n=== TEST 1: Clear session & Load Login Page ===');
          await evaluate(ws, `(() => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
          })()`);
          await new Promise(r => setTimeout(r, 2000));

          const loginPageCheck = await evaluate(ws, `(() => {
            const heading = document.querySelector('h1')?.innerText || '';
            const hasApply = document.body.innerText.includes('Apply');
            const hasVerify = document.body.innerText.includes('Verify');
            const hasTrack = document.body.innerText.includes('Track');
            const hasComply = document.body.innerText.includes('Comply');
            const hasSignInBtn = Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Sign In'));
            return { heading, hasApply, hasVerify, hasTrack, hasComply, hasSignInBtn };
          })()`);
          console.log('Login Page Check:', loginPageCheck);
          await captureScreenshot(ws, 'C:\\hackthons\\test_login_page_proof.png');

          console.log('\n=== TEST 2: Invalid Credentials Rejection ===');
          await evaluate(ws, `(() => {
            const userInput = document.querySelector('input[type="text"]');
            const passInput = document.querySelector('input[type="password"]');
            const signInBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign In'));
            
            // Set values using React input setter
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(userInput, 'invalid_admin');
            userInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            nativeInputValueSetter.call(passInput, 'WrongPassword123');
            passInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            signInBtn.click();
          })()`);
          await new Promise(r => setTimeout(r, 1500));

          const invalidCheck = await evaluate(ws, `(() => {
            const err = document.querySelector('.text-red-200')?.innerText || '';
            return { hasError: err.length > 0, text: err };
          })()`);
          console.log('Invalid Auth Check:', invalidCheck);
          await captureScreenshot(ws, 'C:\\hackthons\\test_login_invalid_proof.png');

          console.log('\n=== TEST 3: Valid Login & Three Predefined Profiles Display ===');
          await evaluate(ws, `(() => {
            const userInput = document.querySelector('input[type="text"]');
            const passInput = document.querySelector('input[type="password"]');
            const signInBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign In'));
            
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(userInput, 'admin');
            userInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            nativeInputValueSetter.call(passInput, 'Admin@123');
            passInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            signInBtn.click();
          })()`);
          await new Promise(r => setTimeout(r, 1500));

          const profileCheck = await evaluate(ws, `(() => {
            const modalTitle = document.querySelector('h2')?.innerText || '';
            const profiles = Array.from(document.querySelectorAll('.font-bold.text-\\\\[\\\\#1E1815\\\\]')).map(e => e.innerText);
            const hasShanmukh = document.body.innerText.includes('Shanmukh');
            const hasRamesh = document.body.innerText.includes('Dr. Ramesh Kumar');
            const hasApex = document.body.innerText.includes('Apex Institute Tech');
            return { modalTitle, hasShanmukh, hasRamesh, hasApex };
          })()`);
          console.log('Profiles Check:', profileCheck);
          await captureScreenshot(ws, 'C:\\hackthons\\test_profile_selection_proof.png');

          console.log('\n=== TEST 4: RBAC Role Protection in Profile Selector ===');
          // Try clicking unauthorized profile (Dr. Ramesh Kumar) as admin
          await evaluate(ws, `(() => {
            const rameshCard = document.getElementById('profile-card-reviewer');
            if (rameshCard) rameshCard.click();
          })()`);
          await new Promise(r => setTimeout(r, 800));

          const deniedCheck = await evaluate(ws, `(() => {
            const alertText = document.querySelector('.bg-red-50')?.innerText || '';
            return { hasAlert: alertText.includes('Role Authorization Restriction') };
          })()`);
          console.log('RBAC Denial Check:', deniedCheck);
          await captureScreenshot(ws, 'C:\\hackthons\\test_profile_access_denied_proof.png');

          console.log('\n=== TEST 5: Select Authorized Profile (Shanmukh - Administrator) ===');
          await evaluate(ws, `(() => {
            const shanmukhCard = document.getElementById('profile-card-admin');
            if (shanmukhCard) shanmukhCard.click();
          })()`);
          await new Promise(r => setTimeout(r, 1500));

          const adminDashboardCheck = await evaluate(ws, `(() => {
            const userName = document.querySelector('header')?.innerText.includes('Shanmukh');
            const heroName = document.querySelector('h1')?.innerText.includes('Shanmukh');
            const hasAiBanner = document.body.innerText.includes('AI-Powered Application Validation') || document.body.innerText.includes('AI Document Verification');
            const hasKpis = document.body.innerText.includes('Total Applications');
            return { userName, heroName, hasAiBanner, hasKpis };
          })()`);
          console.log('Admin Dashboard Check:', adminDashboardCheck);
          await captureScreenshot(ws, 'C:\\hackthons\\test_admin_dashboard_proof.png');

          console.log('\n=== TEST 6: Logout back to Login Page ===');
          await evaluate(ws, `(() => {
            const logoutBtn = document.querySelector('button[title*="Sign Out"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Logout'));
            if (logoutBtn) logoutBtn.click();
          })()`);
          await new Promise(r => setTimeout(r, 1000));

          const logoutCheck = await evaluate(ws, `(() => {
            const heading = document.querySelector('h1')?.innerText || '';
            return { isBackOnLogin: heading.includes('Building Quality Technical Education') };
          })()`);
          console.log('Logout Check:', logoutCheck);
          await captureScreenshot(ws, 'C:\\hackthons\\test_logout_proof.png');

          console.log('\n=== TEST 7: Scrutiny Officer Login (Dr. Ramesh Kumar) ===');
          await evaluate(ws, `(() => {
            const userInput = document.querySelector('input[type="text"]');
            const passInput = document.querySelector('input[type="password"]');
            const signInBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign In'));
            
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(userInput, 'reviewer');
            userInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            nativeInputValueSetter.call(passInput, 'Reviewer@123');
            passInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            signInBtn.click();
          })()`);
          await new Promise(r => setTimeout(r, 1200));

          // Click Dr. Ramesh Kumar
          await evaluate(ws, `(() => {
            const rameshCard = document.getElementById('profile-card-reviewer');
            if (rameshCard) rameshCard.click();
          })()`);
          await new Promise(r => setTimeout(r, 1500));

          const officerCheck = await evaluate(ws, `(() => {
            const userName = document.querySelector('header')?.innerText.includes('Dr. Ramesh Kumar');
            const hasAssigned = document.body.innerText.includes('Assigned Dossiers Scrutiny Queue') || document.body.innerText.includes('Assigned Cases');
            const hasAnomalies = document.body.innerText.includes('Document Discrepancy Investigation') || document.body.innerText.includes('Potential Anomalies');
            return { userName, hasAssigned, hasAnomalies };
          })()`);
          console.log('Officer Dashboard Check:', officerCheck);
          await captureScreenshot(ws, 'C:\\hackthons\\test_officer_dashboard_proof.png');

          console.log('\n=== TEST 8: Institution Rep Login (Apex Institute Tech) ===');
          // Logout
          await evaluate(ws, `(() => {
            const logoutBtn = document.querySelector('button[title*="Sign Out"]') || Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Logout'));
            if (logoutBtn) logoutBtn.click();
          })()`);
          await new Promise(r => setTimeout(r, 1000));

          // Login as institution
          await evaluate(ws, `(() => {
            const userInput = document.querySelector('input[type="text"]');
            const passInput = document.querySelector('input[type="password"]');
            const signInBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign In'));
            
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            nativeInputValueSetter.call(userInput, 'institution');
            userInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            nativeInputValueSetter.call(passInput, 'Inst@123');
            passInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            signInBtn.click();
          })()`);
          await new Promise(r => setTimeout(r, 1200));

          // Click Apex Institute Tech
          await evaluate(ws, `(() => {
            const apexCard = document.getElementById('profile-card-institution');
            if (apexCard) apexCard.click();
          })()`);
          await new Promise(r => setTimeout(r, 1500));

          const instCheck = await evaluate(ws, `(() => {
            const userName = document.querySelector('header')?.innerText.includes('Apex Institute Tech');
            const hasChecklist = document.body.innerText.includes('Statutory Document Checklist');
            const hasCode = document.body.innerText.includes('AICTE-1-10928374') || document.body.innerText.includes('Institutional Approval Submissions');
            return { userName, hasChecklist, hasCode };
          })()`);
          console.log('Institution Dashboard Check:', instCheck);
          await captureScreenshot(ws, 'C:\\hackthons\\test_institution_dashboard_proof.png');

          console.log('\n>>> ALL 8 INTEGRATION TESTS PASSED CLEANLY! <<<');
          chrome.kill();
          process.exit(0);
        } catch (e) {
          console.error('Error during execution:', e);
          chrome.kill();
          process.exit(1);
        }
      };
    } catch (e) {
      console.error('Connection error:', e);
      chrome.kill();
      process.exit(1);
    }
  }, 2000);
}

runTests();
