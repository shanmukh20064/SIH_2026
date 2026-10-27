/**
 * AICTE Scrutiny & Compliance Platform API Service
 * Connects React UI to FastAPI backend with automatic JWT token management.
 */

const BASE_URL = import.meta.env.VITE_BACKEND_URL || ''; // Relative path, proxied via Vite in dev and served directly in prod

export const authState = {
  token: localStorage.getItem('aicte_jwt_token') || '',
  user: JSON.parse(localStorage.getItem('aicte_user') || 'null'),
};

export function setAuthSession(token, user) {
  authState.token = token || '';
  authState.user = user || null;
  if (token) {
    localStorage.setItem('aicte_jwt_token', token);
  } else {
    localStorage.removeItem('aicte_jwt_token');
  }
  if (user) {
    localStorage.setItem('aicte_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('aicte_user');
  }
}

export function clearAuthSession() {
  authState.token = '';
  authState.user = null;
  localStorage.removeItem('aicte_jwt_token');
  localStorage.removeItem('aicte_user');
}

// Authenticate to get valid JWT token with user-provided credentials
export async function ensureAuth(username, password) {
  if (authState.token) {
    return authState.token;
  }
  const u = username || authState.user?.username;
  const p = password || authState.user?.password;
  if (!u || !p) {
    return '';
  }
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p }),
    });
    if (res.ok) {
      const data = await res.json();
      authState.token = data.access_token;
      localStorage.setItem('aicte_jwt_token', data.access_token);
      return data.access_token;
    }
  } catch (err) {
    console.warn('Backend login error:', err);
  }
  return '';
}

// Helper to get authorization headers
export async function getHeaders(includeContentType = true) {
  const token = await ensureAuth();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

// 1. Dashboard KPI Summary
export async function getDashboardSummary() {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/dashboard/summary`, { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Dashboard summary fetch error:', e);
  }
  return null;
}

// 2. Applications List
export async function getApplications(params = {}) {
  try {
    const headers = await getHeaders();
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/api/applications?${query}`, { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Applications fetch error:', e);
  }
  return [];
}

// 3. Application Detail (with documents & findings)
export async function getApplicationDetail(appId) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/applications/${appId}`, { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Application detail fetch error:', e);
  }
  return null;
}

// 4. Create New Application
export async function createApplication(payload) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/applications`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Create application error:', e);
  }
  return null;
}

// 5. Upload Document with PyMuPDF Extraction & Hash Check
export async function uploadDocument(appId, file, docType) {
  try {
    const token = await ensureAuth();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', docType);

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}/api/applications/${appId}/documents`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Upload document error:', e);
  }
  return null;
}

// 6. Run Validation Engine
export async function runValidationEngine(appId) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/applications/${appId}/validate`, {
      method: 'POST',
      headers,
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Validation error:', e);
  }
  return null;
}

// 7. Review Finding (Confirm, Dismiss, Resolve)
export async function reviewFinding(findingId, reviewStatus, justification = '') {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/findings/${findingId}/review`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ review_status: reviewStatus, remarks: justification }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Review finding error:', e);
  }
  return null;
}

// 8. Fetch Compliance Rules
export async function getComplianceRules() {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/rules`, { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Get rules error:', e);
  }
  return [];
}

// 9. Update / Toggle Rule
export async function updateComplianceRule(ruleCode, payload) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/rules/${ruleCode}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Update rule error:', e);
  }
  return null;
}

// 10. Audit Trail Logs
export async function getAuditLogs(limit = 50) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/audit?limit=${limit}`, { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Audit logs error:', e);
  }
  return [];
}

// 11. Issuing Authority Verification
export async function verifyWithAdapter(documentId, adapterName) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/verification/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ document_id: documentId, adapter_name: adapterName }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Verification adapter error:', e);
  }
  return null;
}

// 12. Institutions Registry
export async function getInstitutions() {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/institutions`, { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Institutions fetch error:', e);
  }
  return [];
}

// 13. Authorized Institution for current Representative
export async function getMyInstitution() {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/institutions/my-institution`, { headers });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('My institution fetch error:', e);
  }
  return null;
}

// 14. Update Institution Profile
export async function updateInstitutionProfile(institutionId, payload) {
  try {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/api/institutions/${institutionId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Update institution profile error:', e);
  }
  return null;
}
