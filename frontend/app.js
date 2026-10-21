/**
 * ReguValidate - Modern Vanilla JS Frontend (SIH 2026)
 * Real-time connection to FastAPI backend
 */

// Global State
const state = {
    user: null,
    activeView: "dashboard",
    currentAppId: null,
    currentDocForInspector: null,
    institutionsCache: []
};

// ================= INITIALIZATION & AUTH =================
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    initNav();
    initTheme();
    initModals();
    initForms();
});

function initAuth() {
    const savedUser = localStorage.getItem("regu_user");
    if (savedUser) {
        try {
            state.user = JSON.parse(savedUser);
            updateUserUI();
            loadDashboard();
            return;
        } catch (e) {
            localStorage.removeItem("regu_user");
        }
    }
    // Auto-login as default demo Reviewer
    loginUser("reviewer", "Reviewer@123");
}

async function loginUser(username, password) {
    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) {
            const err = await res.json();
            showToast(err.detail || "Authentication failed", "error");
            openModal("modal-login");
            return;
        }
        const data = await res.json();
        state.user = data;
        localStorage.setItem("regu_user", JSON.stringify(data));
        updateUserUI();
        closeModal("modal-login");
        showToast(`Signed in as ${data.full_name} (${data.role})`, "success");
        loadDashboard();
    } catch (err) {
        showToast("Error connecting to auth service", "error");
    }
}

function updateUserUI() {
    if (!state.user) return;
    document.getElementById("user-name-display").textContent = state.user.full_name;
    document.getElementById("user-role-display").textContent = state.user.role.toUpperCase();
    
    // Initials
    const initials = state.user.full_name.split(" ").map(w => w[0]).join("").slice(0, 2);
    document.getElementById("user-avatar-initials").textContent = initials || "RV";
}

function getAuthHeaders(isJson = true) {
    const headers = {};
    if (state.user && state.user.access_token) {
        headers["Authorization"] = `Bearer ${state.user.access_token}`;
    }
    if (isJson) {
        headers["Content-Type"] = "application/json";
    }
    return headers;
}

// ================= NAVIGATION & VIEWS =================
function initNav() {
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetView = btn.getAttribute("data-view");
            switchView(targetView);
        });
    });

    document.getElementById("btn-back-to-apps").addEventListener("click", () => {
        switchView("applications");
    });

    document.getElementById("btn-quick-new-app").addEventListener("click", () => {
        openNewAppModal();
    });

    document.getElementById("btn-open-create-app-modal").addEventListener("click", () => {
        openNewAppModal();
    });

    document.getElementById("btn-refresh-dashboard").addEventListener("click", () => {
        loadDashboard();
        showToast("Dashboard refreshed", "info");
    });

    document.getElementById("btn-view-all-audit").addEventListener("click", () => {
        switchView("audit");
    });

    document.getElementById("btn-refresh-audit").addEventListener("click", () => {
        loadAuditTrail();
    });

    document.getElementById("btn-logout").addEventListener("click", () => {
        localStorage.removeItem("regu_user");
        state.user = null;
        openModal("modal-login");
    });

    document.getElementById("user-badge").addEventListener("click", () => {
        openModal("modal-login");
    });

    // Sub-tabs in Scrutiny Workspace
    document.querySelectorAll(".tab-btn").forEach(tBtn => {
        tBtn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
            
            tBtn.classList.add("active");
            const tabId = tBtn.getAttribute("data-tab");
            document.getElementById(tabId).classList.add("active");
        });
    });
}

function switchView(viewName) {
    state.activeView = viewName;
    document.querySelectorAll(".app-view").forEach(v => v.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

    const activeViewEl = document.getElementById(`view-${viewName}`);
    if (activeViewEl) activeViewEl.classList.add("active");

    const activeNavBtn = document.getElementById(`nav-${viewName}`);
    if (activeNavBtn) activeNavBtn.classList.add("active");

    if (viewName === "dashboard") loadDashboard();
    if (viewName === "applications") loadApplications();
    if (viewName === "rules") loadRules();
    if (viewName === "audit") loadAuditTrail();
}

// ================= DASHBOARD MODULE =================
async function loadDashboard() {
    try {
        const res = await fetch("/api/dashboard/summary", {
            headers: getAuthHeaders()
        });
        if (!res.ok) return;
        const data = await res.json();

        // Update KPI counters
        document.getElementById("stat-total-apps").textContent = data.total_applications;
        document.getElementById("stat-pending-scrutiny").textContent = data.pending_scrutiny;
        document.getElementById("stat-critical-findings").textContent = data.findings_by_severity.CRITICAL || 0;
        document.getElementById("stat-approved-apps").textContent = data.approved_applications;

        // Update severity bars
        const totalFindings = Math.max(1, data.total_findings);
        const crit = data.findings_by_severity.CRITICAL || 0;
        const maj = data.findings_by_severity.MAJOR || 0;
        const min = data.findings_by_severity.MINOR || 0;

        document.getElementById("count-crit").textContent = crit;
        document.getElementById("count-maj").textContent = maj;
        document.getElementById("count-min").textContent = min;

        document.getElementById("bar-crit").style.width = `${(crit / totalFindings) * 100}%`;
        document.getElementById("bar-maj").style.width = `${(maj / totalFindings) * 100}%`;
        document.getElementById("bar-min").style.width = `${(min / totalFindings) * 100}%`;

        // Render Recent Activity Feed
        const feedEl = document.getElementById("dashboard-recent-activity");
        if (!data.recent_activity || data.recent_activity.length === 0) {
            feedEl.innerHTML = `<div class="text-muted text-sm">No recent activity recorded.</div>`;
            return;
        }

        feedEl.innerHTML = data.recent_activity.map(act => {
            const timeStr = act.timestamp ? act.timestamp.slice(11, 19) + " UTC" : "";
            let icon = "📝";
            if (act.action.includes("VALIDATION")) icon = "⚡";
            if (act.action.includes("UPLOAD")) icon = "📤";
            if (act.action.includes("REVIEW")) icon = "🔎";
            if (act.action.includes("LOGIN")) icon = "🔑";

            return `
            <div class="activity-item">
                <span class="activity-icon">${icon}</span>
                <div class="activity-content">
                    <span class="activity-action">${formatActionName(act.action)}</span>
                    <span class="activity-desc text-xs text-muted">by ${act.username} on ${act.resource_type}</span>
                    <span class="activity-time">${timeStr}</span>
                </div>
            </div>
            `;
        }).join("");

    } catch (e) {
        console.error("Dashboard load error", e);
    }
}

// ================= APPLICATIONS LIST MODULE =================
async function loadApplications() {
    const search = document.getElementById("app-search-input").value;
    const category = document.getElementById("filter-app-category").value;
    const status = document.getElementById("filter-app-status").value;

    let url = "/api/applications?limit=50";
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;

    const tbody = document.getElementById("applications-tbody");
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">Loading applications...</td></tr>`;

    try {
        const res = await fetch(url, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to load applications");
        const apps = await res.json();

        if (apps.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No applications found matching criteria.</td></tr>`;
            return;
        }

        tbody.innerHTML = apps.map(app => {
            const instName = app.institution ? app.institution.name : "N/A";
            const instCode = app.institution ? app.institution.institution_code : "N/A";
            const subDate = app.submission_date ? app.submission_date.slice(0, 10) : "Draft";

            return `
            <tr>
                <td><strong><code>${app.application_number}</code></strong></td>
                <td><strong>${instName}</strong></td>
                <td><code>${instCode}</code></td>
                <td>${formatCategory(app.category)}</td>
                <td>${app.academic_year}</td>
                <td><span class="status-pill status-${app.status.toLowerCase()}">${app.status}</span></td>
                <td>${subDate}</td>
                <td>
                    <button class="btn btn-xs btn-primary btn-inspect-app" data-id="${app.id}">
                        🔍 Scrutinize
                    </button>
                </td>
            </tr>
            `;
        }).join("");

        // Attach Scrutinize Click Handlers
        document.querySelectorAll(".btn-inspect-app").forEach(b => {
            b.addEventListener("click", () => {
                const appId = b.getAttribute("data-id");
                openScrutinyWorkspace(appId);
            });
        });

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading applications.</td></tr>`;
    }
}

// ================= SCRUTINY WORKSPACE MODULE =================
async function openScrutinyWorkspace(applicationId) {
    state.currentAppId = applicationId;
    switchView("scrutiny");

    // Load full application details
    try {
        const res = await fetch(`/api/applications/${applicationId}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error("Failed to load application details");
        const app = await res.json();

        // Update Banner
        const inst = app.institution || {};
        document.getElementById("detail-inst-name").textContent = inst.name || "Unknown Institution";
        document.getElementById("detail-inst-code").textContent = inst.institution_code || "N/A";
        document.getElementById("detail-app-num").textContent = app.application_number;
        document.getElementById("detail-app-category").textContent = formatCategory(app.category);
        document.getElementById("detail-app-year").textContent = app.academic_year;

        const statusEl = document.getElementById("detail-app-status");
        statusEl.className = `status-pill status-${app.status.toLowerCase()}`;
        statusEl.textContent = app.status;

        // Set status transition dropdown
        document.getElementById("select-status-transition").value = app.status;

        // Badge Counts
        document.getElementById("badge-findings-count").textContent = app.findings.length;
        document.getElementById("badge-docs-count").textContent = app.documents.length;

        // Render Findings Tab
        renderFindingsTab(app.findings);

        // Render Documents Tab
        renderDocumentsTab(app.documents);

        // Render Verification Tab
        renderVerificationTab(app.verification_attempts);

        // Setup Export Buttons
        setupExportHandlers(app.id, app.application_number);

    } catch (err) {
        showToast("Error loading scrutiny workspace", "error");
    }
}

function renderFindingsTab(findings) {
    const container = document.getElementById("findings-list-container");
    if (!findings || findings.length === 0) {
        container.innerHTML = `
        <div class="panel text-center" style="padding: 40px;">
            <span style="font-size: 32px; display: block; margin-bottom: 10px;">✨</span>
            <h4 style="font-size: 16px; margin-bottom: 6px;">No Findings Identified</h4>
            <p class="text-muted text-sm">Run the validation engine above to perform automated checks on the submitted dossier.</p>
        </div>
        `;
        return;
    }

    container.innerHTML = findings.map(f => {
        const sevClass = f.severity.toLowerCase();
        let statusBadgeClass = "tag-warning";
        if (f.review_status === "CONFIRMED") statusBadgeClass = "tag-danger";
        if (f.review_status === "RESOLVED") statusBadgeClass = "tag-success";
        if (f.review_status === "DISMISSED") statusBadgeClass = "tag-info";

        return `
        <div class="finding-card severity-${sevClass}">
            <div class="finding-card-header">
                <div class="finding-tags">
                    <span class="tag tag-${sevClass === 'critical' ? 'danger' : sevClass === 'major' ? 'warning' : 'info'}">${f.severity}</span>
                    <span class="tag tag-sm" style="background: rgba(255,255,255,0.06);">${f.rule_code} (v${f.rule_version})</span>
                    <span class="tag tag-sm" style="background: rgba(255,255,255,0.06);">Method: ${f.detection_method}</span>
                </div>
                <div>
                    <span class="tag ${statusBadgeClass}">${f.review_status}</span>
                </div>
            </div>

            <h4 class="finding-headline">${f.title}</h4>
            <p class="finding-body">${f.explanation}</p>

            ${f.evidence_text ? `
            <div class="evidence-box">
                <span class="text-sub text-xs">SOURCE EVIDENCE:</span>
                <code>${escapeHtml(f.evidence_text)}</code>
            </div>
            ` : ''}

            ${f.reviewer_notes ? `
            <div class="evidence-box" style="border-left: 3px solid var(--primary); background: rgba(79, 70, 229, 0.08);">
                <span class="text-xs" style="color: var(--primary-light); font-weight: 700;">REVIEWER DETERMINATION:</span>
                <p style="margin: 4px 0 0; font-size: 13px;">${escapeHtml(f.reviewer_notes)}</p>
            </div>
            ` : ''}

            <div class="action-row">
                <span class="recommended-step">💡 <strong>Action:</strong> ${f.recommended_action || 'Inspect physical documents.'}</span>
                <button class="btn btn-xs btn-outline btn-review-finding" 
                    data-id="${f.id}" 
                    data-title="${escapeHtml(f.title)}" 
                    data-explanation="${escapeHtml(f.explanation)}"
                    data-status="${f.review_status}"
                    data-notes="${escapeHtml(f.reviewer_notes || '')}">
                    ⚖️ Review Determination
                </button>
            </div>
        </div>
        `;
    }).join("");

    // Attach finding review click handlers
    document.querySelectorAll(".btn-review-finding").forEach(b => {
        b.addEventListener("click", () => {
            const fid = b.getAttribute("data-id");
            const title = b.getAttribute("data-title");
            const exp = b.getAttribute("data-explanation");
            const status = b.getAttribute("data-status");
            const notes = b.getAttribute("data-notes");

            document.getElementById("review-finding-id").value = fid;
            document.getElementById("review-finding-title").textContent = title;
            document.getElementById("review-finding-explanation").textContent = exp;
            document.getElementById("review-status-select").value = status || "CONFIRMED";
            document.getElementById("review-notes-input").value = notes || "";

            openModal("modal-finding-review");
        });
    });
}

function renderDocumentsTab(documents) {
    const tbody = document.getElementById("docs-tbody");
    if (!documents || documents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No statutory documents uploaded yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = documents.map(d => {
        const hashShort = d.sha256_hash.slice(0, 16) + "...";
        const modeBadge = d.is_scanned 
            ? `<span class="tag tag-warning">Scanned (OCR)</span>`
            : `<span class="tag tag-info">Digital PDF</span>`;

        return `
        <tr>
            <td><strong>${formatDocType(d.document_type)}</strong></td>
            <td>${d.original_filename}</td>
            <td><code title="${d.sha256_hash}">${hashShort}</code></td>
            <td>${modeBadge}</td>
            <td>${d.page_count}</td>
            <td><span class="status-pill status-${d.processing_status.toLowerCase()}">${d.processing_status}</span></td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button class="btn btn-xs btn-outline btn-inspect-doc" data-id="${d.id}">
                        🔍 Inspector
                    </button>
                    <a href="/api/documents/${d.id}/download" target="_blank" class="btn btn-xs btn-outline" download="${d.original_filename}">
                        ⬇️ File
                    </a>
                </div>
            </td>
        </tr>
        `;
    }).join("");

    // Attach Inspector Handlers
    document.querySelectorAll(".btn-inspect-doc").forEach(b => {
        b.addEventListener("click", () => {
            openDocumentInspector(b.getAttribute("data-id"));
        });
    });
}

function renderVerificationTab(verifications) {
    const container = document.getElementById("verification-results-container");
    if (!verifications || verifications.length === 0) {
        container.innerHTML = `
        <div class="panel text-center" style="grid-column: 1 / -1; padding: 40px;">
            <span style="font-size: 32px; display: block; margin-bottom: 10px;">🏛️</span>
            <h4 style="font-size: 16px; margin-bottom: 6px;">No External Verifications Recorded</h4>
            <p class="text-muted text-sm">Upload documents with certificate numbers to trigger automated simulated registry verification.</p>
        </div>
        `;
        return;
    }

    container.innerHTML = verifications.map(v => {
        let statusBadge = `<span class="tag tag-success">VERIFIED</span>`;
        if (v.status === "EXPIRED") statusBadge = `<span class="tag tag-danger">EXPIRED</span>`;
        if (v.status === "MOCK_SIMULATED") statusBadge = `<span class="tag tag-info">SIMULATED MATCH</span>`;
        if (v.status === "MANUAL_VERIFICATION_REQUIRED") statusBadge = `<span class="tag tag-warning">MANUAL REVIEW REQUIRED</span>`;

        const details = v.response_payload || {};

        return `
        <div class="verif-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; font-weight: 700; color: #38bdf8;">${v.adapter_name}</span>
                ${statusBadge}
            </div>
            <div>
                <span class="text-xs text-sub">REGISTRY REFERENCE:</span>
                <div style="font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 14px;">${v.external_reference || 'N/A'}</div>
            </div>
            <div style="font-size: 12px; background: rgba(0,0,0,0.25); padding: 10px; border-radius: var(--radius-sm);">
                <div><strong>Registered Entity:</strong> ${details.registered_name || 'N/A'}</div>
                <div><strong>Cycle / Validity:</strong> ${details.validity || details.valid_till || details.academic_year || 'Active'}</div>
                <div class="text-xs text-muted" style="margin-top: 6px; font-style: italic;">${details.disclaimer || ''}</div>
            </div>
            <span class="text-xs text-sub">Timestamp: ${v.attempted_at ? v.attempted_at.slice(0, 19).replace('T', ' ') : ''} UTC</span>
        </div>
        `;
    }).join("");
}

// Inspector Modal Logic
async function openDocumentInspector(docId) {
    state.currentDocForInspector = docId;
    openModal("modal-extraction-inspector");

    const fieldsList = document.getElementById("inspector-fields-list");
    fieldsList.innerHTML = `<div class="loading-spinner">Loading extracted entities...</div>`;

    try {
        const res = await fetch(`/api/documents/${docId}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to load document");
        const doc = await res.json();

        document.getElementById("inspector-doc-title").textContent = `Extraction: ${doc.original_filename}`;
        document.getElementById("inspector-doc-meta").textContent = `MIME: ${doc.mime_type} | Mode: ${doc.is_scanned ? 'Scanned OCR' : 'Digital PDF'} | Pages: ${doc.page_count}`;

        if (!doc.extracted_fields || doc.extracted_fields.length === 0) {
            fieldsList.innerHTML = `<div class="text-muted text-sm">No structured entities extracted from this document text.</div>`;
            return;
        }

        fieldsList.innerHTML = doc.extracted_fields.map(f => {
            const confidencePct = Math.round(f.confidence * 100);
            return `
            <div class="field-entry-card">
                <div class="field-entry-header">
                    <span class="field-name-tag">${f.field_name}</span>
                    <span class="text-xs text-muted">Page ${f.source_page} | Confidence: ${confidencePct}%</span>
                </div>
                <div class="field-val-display">${escapeHtml(f.normalized_value || f.extracted_value || 'None')}</div>
                ${f.raw_text_snippet ? `<div class="field-snippet">"${escapeHtml(f.raw_text_snippet)}"</div>` : ''}
                ${f.reviewer_corrected_value ? `<div class="tag tag-sm tag-success" style="margin-top: 4px;">Reviewer Corrected</div>` : ''}
            </div>
            `;
        }).join("");

    } catch (e) {
        fieldsList.innerHTML = `<div class="text-danger">Failed to load extraction details.</div>`;
    }
}

// ================= COMPLIANCE RULES PANEL =================
async function loadRules() {
    const tbody = document.getElementById("rules-tbody");
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Loading compliance rules...</td></tr>`;

    try {
        const res = await fetch("/api/rules", { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to load rules");
        const rules = await res.json();

        tbody.innerHTML = rules.map(r => {
            const sevTag = r.severity === 'CRITICAL' ? 'tag-danger' : r.severity === 'MAJOR' ? 'tag-warning' : 'tag-info';
            const statusBtnText = r.is_enabled ? 'Disable' : 'Enable';
            const statusBtnClass = r.is_enabled ? 'btn-outline' : 'btn-primary';

            return `
            <tr>
                <td><code><strong>${r.rule_code}</strong></code></td>
                <td><span class="tag tag-sm">v${r.version}</span></td>
                <td>
                    <div style="font-weight: 600;">${r.title}</div>
                    <div class="text-xs text-muted" style="max-width: 450px;">${r.description}</div>
                </td>
                <td><span class="tag tag-sm" style="background: rgba(255,255,255,0.06);">${r.category}</span></td>
                <td><span class="tag ${sevTag}">${r.severity}</span></td>
                <td>
                    <span class="tag ${r.is_enabled ? 'tag-success' : 'tag-danger'}">
                        ${r.is_enabled ? 'Active' : 'Disabled'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-xs ${statusBtnClass} btn-toggle-rule" data-code="${r.rule_code}" data-enabled="${r.is_enabled}">
                        ${statusBtnText}
                    </button>
                </td>
            </tr>
            `;
        }).join("");

        // Toggle rule handlers
        document.querySelectorAll(".btn-toggle-rule").forEach(b => {
            b.addEventListener("click", async () => {
                const code = b.getAttribute("data-code");
                const currentEnabled = b.getAttribute("data-enabled") === "true";
                await toggleRule(code, !currentEnabled);
            });
        });

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error loading compliance rules.</td></tr>`;
    }
}

async function toggleRule(ruleCode, newEnabledState) {
    try {
        const res = await fetch(`/api/rules/${ruleCode}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({ is_enabled: newEnabledState })
        });
        if (!res.ok) {
            const err = await res.json();
            showToast(err.detail || "Only administrators can modify compliance rules.", "error");
            return;
        }
        showToast(`Rule '${ruleCode}' version updated to ${newEnabledState ? 'Active' : 'Disabled'}`, "success");
        loadRules();
    } catch (e) {
        showToast("Error updating rule", "error");
    }
}

// ================= AUDIT TRAIL MODULE =================
async function loadAuditTrail() {
    const tbody = document.getElementById("audit-tbody");
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Loading audit events...</td></tr>`;

    try {
        const res = await fetch("/api/audit?limit=100", { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to load audit events");
        const events = await res.json();

        if (events.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No audit events logged.</td></tr>`;
            return;
        }

        tbody.innerHTML = events.map(e => {
            const timeStr = e.timestamp ? e.timestamp.replace('T', ' ').slice(0, 19) : "";
            const detailsJson = JSON.stringify(e.details || {});

            return `
            <tr>
                <td><code>${timeStr}</code></td>
                <td><strong>${e.action}</strong></td>
                <td>${e.username || 'System'}</td>
                <td><span class="tag tag-sm" style="background: rgba(255,255,255,0.06);">${e.resource_type}</span></td>
                <td><code>${e.resource_id ? e.resource_id.slice(0, 12) + '...' : 'N/A'}</code></td>
                <td><code>${e.ip_address}</code></td>
                <td><small style="font-family: 'JetBrains Mono', monospace;">${escapeHtml(detailsJson)}</small></td>
            </tr>
            `;
        }).join("");

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load audit trail.</td></tr>`;
    }
}

// ================= FORM ACTIONS & MODALS =================
function initForms() {
    // 1. Validation Trigger Button
    document.getElementById("btn-trigger-validation").addEventListener("click", async () => {
        if (!state.currentAppId) return;
        const btn = document.getElementById("btn-trigger-validation");
        btn.textContent = "⏳ Running Validation Engine...";
        btn.disabled = true;

        try {
            const res = await fetch(`/api/applications/${state.currentAppId}/validate`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({})
            });
            if (!res.ok) {
                const err = await res.json();
                showToast(err.detail || "Validation execution failed", "error");
                return;
            }
            const valRun = await res.json();
            showToast(`Validation complete: ${valRun.total_findings} finding(s) detected.`, "success");
            openScrutinyWorkspace(state.currentAppId);
        } catch (e) {
            showToast("Error triggering validation", "error");
        } finally {
            btn.textContent = "⚡ Run Validation Engine";
            btn.disabled = false;
        }
    });

    // 2. Status Transition Button
    document.getElementById("btn-update-app-status").addEventListener("click", async () => {
        if (!state.currentAppId) return;
        const newStatus = document.getElementById("select-status-transition").value;

        try {
            const res = await fetch(`/api/applications/${state.currentAppId}`, {
                method: "PATCH",
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) {
                const err = await res.json();
                showToast(err.detail || "Failed to update status", "error");
                return;
            }
            showToast(`Application status transitioned to ${newStatus}`, "success");
            openScrutinyWorkspace(state.currentAppId);
        } catch (e) {
            showToast("Error updating application status", "error");
        }
    });

    // 3. Document Upload Form
    document.getElementById("form-upload-doc").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!state.currentAppId) return;

        const docType = document.getElementById("upload-doc-type").value;
        const fileInput = document.getElementById("upload-file-input");
        if (!fileInput.files || fileInput.files.length === 0) {
            showToast("Please select a document file to upload", "warning");
            return;
        }

        const submitBtn = document.getElementById("btn-submit-upload");
        submitBtn.textContent = "Uploading & Ingesting...";
        submitBtn.disabled = true;

        const formData = new FormData();
        formData.append("document_type", docType);
        formData.append("file", fileInput.files[0]);

        try {
            const res = await fetch(`/api/applications/${state.currentAppId}/documents`, {
                method: "POST",
                headers: getAuthHeaders(false),
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                showToast(err.detail || "Document upload failed", "error");
                return;
            }

            const doc = await res.json();
            showToast(`Document ingested: ${doc.original_filename} (SHA-256 validated)`, "success");
            fileInput.value = "";
            openScrutinyWorkspace(state.currentAppId);
        } catch (err) {
            showToast("Error uploading document", "error");
        } finally {
            submitBtn.textContent = "Upload & Ingest";
            submitBtn.disabled = false;
        }
    });

    // 4. Field Override Form
    document.getElementById("form-field-override").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!state.currentDocForInspector) return;

        const fieldName = document.getElementById("override-field-name").value;
        const correctedVal = document.getElementById("override-field-val").value;
        const notes = document.getElementById("override-notes").value;

        try {
            const res = await fetch(`/api/documents/${state.currentDocForInspector}/fields/${fieldName}/override`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    field_name: fieldName,
                    corrected_value: correctedVal,
                    reviewer_notes: notes
                })
            });

            if (!res.ok) {
                const err = await res.json();
                showToast(err.detail || "Field correction failed", "error");
                return;
            }

            showToast(`Field '${fieldName}' manually corrected. Re-run validation to test consistency.`, "success");
            openDocumentInspector(state.currentDocForInspector);
        } catch (e) {
            showToast("Error saving field correction", "error");
        }
    });

    // 5. Finding Review Form
    document.getElementById("form-review-finding").addEventListener("submit", async (e) => {
        e.preventDefault();
        const fid = document.getElementById("review-finding-id").value;
        const revStatus = document.getElementById("review-status-select").value;
        const revNotes = document.getElementById("review-notes-input").value;

        try {
            const res = await fetch(`/api/findings/${fid}/review`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    review_status: revStatus,
                    reviewer_notes: revNotes
                })
            });

            if (!res.ok) {
                const err = await res.json();
                showToast(err.detail || "Finding review update failed", "error");
                return;
            }

            closeModal("modal-finding-review");
            showToast("Determination recorded successfully in immutable audit trail.", "success");
            openScrutinyWorkspace(state.currentAppId);
        } catch (e) {
            showToast("Error updating finding review", "error");
        }
    });

    // 6. Create Application Form
    document.getElementById("form-create-app").addEventListener("submit", async (e) => {
        e.preventDefault();
        const instId = document.getElementById("new-app-inst").value;
        const category = document.getElementById("new-app-category").value;
        const year = document.getElementById("new-app-year").value;

        try {
            const res = await fetch("/api/applications", {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    institution_id: instId,
                    category: category,
                    academic_year: year
                })
            });

            if (!res.ok) {
                const err = await res.json();
                showToast(err.detail || "Failed to create application", "error");
                return;
            }

            const app = await res.json();
            closeModal("modal-new-app");
            showToast(`Application ${app.application_number} created successfully.`, "success");
            openScrutinyWorkspace(app.id);
        } catch (e) {
            showToast("Error creating application", "error");
        }
    });

    // 7. Login Form
    document.getElementById("form-login").addEventListener("submit", (e) => {
        e.preventDefault();
        const u = document.getElementById("login-username").value;
        const p = document.getElementById("login-password").value;
        loginUser(u, p);
    });

    // Filter bar inputs
    document.getElementById("btn-apply-filters").addEventListener("click", () => {
        loadApplications();
    });

    document.getElementById("btn-reset-filters").addEventListener("click", () => {
        document.getElementById("app-search-input").value = "";
        document.getElementById("filter-app-category").value = "";
        document.getElementById("filter-app-status").value = "";
        loadApplications();
    });

    // Role quick-picker pills in login modal
    document.querySelectorAll(".role-pill").forEach(p => {
        p.addEventListener("click", () => {
            document.querySelectorAll(".role-pill").forEach(x => x.classList.remove("active"));
            p.classList.add("active");
            document.getElementById("login-username").value = p.getAttribute("data-user");
            document.getElementById("login-password").value = p.getAttribute("data-pass");
        });
    });
}

function setupExportHandlers(appId, appNumber) {
    document.getElementById("btn-export-html").onclick = () => {
        window.open(`/api/applications/${appId}/reports?format=html`, "_blank");
    };
    document.getElementById("btn-export-json").onclick = () => {
        window.open(`/api/applications/${appId}/reports?format=json`, "_blank");
    };
    document.getElementById("btn-export-csv").onclick = () => {
        window.location.href = `/api/applications/${appId}/reports?format=csv`;
    };
}

async function openNewAppModal() {
    const select = document.getElementById("new-app-inst");
    select.innerHTML = `<option value="">Loading institutions...</option>`;

    try {
        const res = await fetch("/api/institutions", { headers: getAuthHeaders() });
        if (res.ok) {
            const insts = await res.json();
            select.innerHTML = insts.map(i => `<option value="${i.id}">${i.name} (${i.institution_code})</option>`).join("");
        }
    } catch (e) {
        select.innerHTML = `<option value="">Failed to load institutions</option>`;
    }
    openModal("modal-new-app");
}

// ================= MODAL HELPERS =================
function initModals() {
    document.getElementById("btn-close-new-app-modal").onclick = () => closeModal("modal-new-app");
    document.getElementById("btn-cancel-new-app").onclick = () => closeModal("modal-new-app");

    document.getElementById("btn-close-inspector").onclick = () => closeModal("modal-extraction-inspector");
    document.getElementById("btn-close-review-modal").onclick = () => closeModal("modal-finding-review");
    document.getElementById("btn-cancel-review").onclick = () => closeModal("modal-finding-review");
    document.getElementById("btn-close-login").onclick = () => closeModal("modal-login");
}

function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add("open");
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove("open");
}

// ================= THEME TOGGLE =================
function initTheme() {
    const btn = document.getElementById("theme-toggle");
    const icon = document.getElementById("theme-icon");
    const savedTheme = localStorage.getItem("regu_theme") || "dark";

    if (savedTheme === "light") {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        icon.textContent = "🌙";
    }

    btn.addEventListener("click", () => {
        if (document.body.classList.contains("dark-theme")) {
            document.body.classList.remove("dark-theme");
            document.body.classList.add("light-theme");
            icon.textContent = "🌙";
            localStorage.setItem("regu_theme", "light");
        } else {
            document.body.classList.remove("light-theme");
            document.body.classList.add("dark-theme");
            icon.textContent = "☀️";
            localStorage.setItem("regu_theme", "dark");
        }
    });
}

// ================= UTILITY HELPERS =================
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function formatCategory(cat) {
    if (!cat) return "";
    return cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatDocType(type) {
    if (!type) return "";
    return type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatActionName(action) {
    if (!action) return "";
    return action.replace(/_/g, " ");
}

function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
