/**
 * AICTE Regulatory Application Validation & Compliance Platform
 * Master Frontend Controller (SIH 2026)
 */

// Global Application State
const state = {
    user: null,
    activeView: "dashboard",
    currentAppId: null,
    currentDocForInspector: null,
    institutionsCache: [],
    applicationsCache: []
};

// ================= INITIALIZATION & AUTH =================
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
    initNavigation();
    initDropdownHoverboard();
    initQuickActions();
    initModals();
    initForms();
    initAppearanceSettings();
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
    // Default sign in as Shanmukh / Administrator
    loginUser("admin", "Admin@123");
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
    const nameDisplay = document.getElementById("header-user-name");
    const roleDisplay = document.getElementById("header-user-role");
    const avatarDisplay = document.getElementById("header-avatar-initials");

    if (nameDisplay) {
        nameDisplay.textContent = state.user.full_name.includes("Shanmukh") 
            ? "Shanmukh" 
            : state.user.full_name.split(" ")[0];
    }
    if (roleDisplay) {
        roleDisplay.textContent = state.user.role === "admin" ? "Scrutiny Admin" : state.user.role.toUpperCase();
    }
    if (avatarDisplay) {
        const initials = state.user.full_name.split(" ").map(w => w[0]).join("").slice(0, 2);
        avatarDisplay.textContent = initials || "SK";
    }
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

// ================= NAVIGATION & VIEW ROUTING =================
function initNavigation() {
    // Top Horizontal Navigation Links
    document.querySelectorAll(".nav-link-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const navTarget = btn.getAttribute("data-nav");
            if (navTarget === "dashboard" || navTarget === "applications" || navTarget === "rules" || navTarget === "audit") {
                switchView(navTarget);
            } else if (navTarget === "institutions") {
                switchView("applications");
                showToast("Viewing Institutional Master Records", "info");
            } else if (navTarget === "reports") {
                switchView("applications");
                showToast("Select an application dossier to download official scrutiny reports", "info");
            } else if (navTarget === "help") {
                showToast("AICTE Regulatory Scrutiny Assistance Desk: Toll Free 1800-11-2233", "info");
            }
        });
    });

    // Left Navigation Rail Buttons
    document.querySelectorAll(".sidebar-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const viewTarget = btn.getAttribute("data-view");
            if (viewTarget === "dashboard" || viewTarget === "applications" || viewTarget === "audit") {
                switchView(viewTarget);
            } else if (viewTarget === "compliance-check") {
                switchView("rules");
            } else if (viewTarget === "doc-verification" || viewTarget === "institutions" || viewTarget === "reports") {
                switchView("applications");
            } else if (viewTarget === "users") {
                openModal("modal-login");
            } else if (viewTarget === "settings") {
                openModal("modal-appearance");
            }
        });
    });

    // Brand logo returns to dashboard
    document.getElementById("header-brand-logo").addEventListener("click", (e) => {
        e.preventDefault();
        switchView("dashboard");
    });

    // Back to Applications button in Scrutiny Workspace
    document.getElementById("btn-back-to-apps").addEventListener("click", () => {
        switchView("applications");
    });

    // Clean Tab navigation in Scrutiny Workspace
    document.querySelectorAll(".clean-tab-btn").forEach(tBtn => {
        tBtn.addEventListener("click", () => {
            document.querySelectorAll(".clean-tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-content-panel").forEach(c => c.style.display = "none");

            tBtn.classList.add("active");
            const targetId = tBtn.getAttribute("data-tab");
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.style.display = "block";
        });
    });
}

function switchView(viewName) {
    state.activeView = viewName;
    document.querySelectorAll(".app-view").forEach(v => v.classList.remove("active"));
    
    // Highlight active sidebar item
    document.querySelectorAll(".sidebar-btn").forEach(b => {
        b.classList.remove("active");
        if (b.getAttribute("data-view") === viewName || 
           (viewName === "rules" && b.getAttribute("data-view") === "compliance-check")) {
            b.classList.add("active");
        }
    });

    // Highlight active topnav item
    document.querySelectorAll(".nav-link-btn").forEach(b => {
        b.classList.remove("active");
        if (b.getAttribute("data-nav") === viewName) {
            b.classList.add("active");
        }
    });

    const activeEl = document.getElementById(`view-${viewName}`);
    if (activeEl) activeEl.classList.add("active");

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === "dashboard") loadDashboard();
    if (viewName === "applications") loadApplications();
    if (viewName === "rules") loadRules();
    if (viewName === "audit") loadAuditTrail();
}

// ================= 5. HORIZONTAL DROPDOWN HOVERBOARD =================
function initDropdownHoverboard() {
    const appsNav = document.getElementById("nav-item-applications");
    const appsHoverboard = document.getElementById("apps-hoverboard");
    const appsBtn = document.getElementById("topnav-apps");

    if (!appsNav || !appsHoverboard) return;

    // Click toggle support for touch / keyboard access
    appsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const isOpen = appsNav.classList.contains("dropdown-open");
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });

    function openDropdown() {
        appsNav.classList.add("dropdown-open");
        appsBtn.setAttribute("aria-expanded", "true");
    }

    function closeDropdown() {
        appsNav.classList.remove("dropdown-open");
        appsBtn.setAttribute("aria-expanded", "false");
    }

    // Close on click outside
    document.addEventListener("click", (e) => {
        if (!appsNav.contains(e.target)) {
            closeDropdown();
        }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeDropdown();
        }
    });

    // Dropdown Links Routing
    document.getElementById("hlink-new-app").addEventListener("click", (e) => {
        e.preventDefault();
        closeDropdown();
        openNewAppModal();
    });

    document.getElementById("hlink-track-app").addEventListener("click", (e) => {
        e.preventDefault();
        closeDropdown();
        switchView("applications");
    });

    document.getElementById("hlink-app-history").addEventListener("click", (e) => {
        e.preventDefault();
        closeDropdown();
        switchView("audit");
    });

    document.getElementById("hlink-doc-sub").addEventListener("click", (e) => {
        e.preventDefault();
        closeDropdown();
        switchView("applications");
        showToast("Select application to submit statutory documents", "info");
    });

    document.getElementById("hlink-verif-status").addEventListener("click", (e) => {
        e.preventDefault();
        closeDropdown();
        switchView("applications");
        showToast("Open application dossier to inspect registry verification status", "info");
    });

    document.getElementById("hlink-corresp").addEventListener("click", (e) => {
        e.preventDefault();
        closeDropdown();
        switchView("dashboard");
    });
}

// ================= QUICK ACTION STRIP =================
function initQuickActions() {
    // New Application button on calendar strip
    document.getElementById("btn-strip-new-app").addEventListener("click", () => {
        openNewAppModal();
    });

    // Upload Documents button on calendar strip
    document.getElementById("btn-strip-upload-docs").addEventListener("click", () => {
        if (state.currentAppId) {
            openScrutinyWorkspace(state.currentAppId);
            const docTab = document.getElementById("tab-btn-documents");
            if (docTab) docTab.click();
        } else {
            switchView("applications");
            showToast("Select target application to upload regulatory clearances", "info");
        }
    });

    // Header Quick Search
    document.getElementById("btn-header-search").addEventListener("click", () => {
        switchView("applications");
        const sInput = document.getElementById("app-search-input");
        if (sInput) {
            sInput.focus();
            sInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // Header Notification Button
    document.getElementById("btn-header-notifs").addEventListener("click", () => {
        showToast("You have 3 active compliance notices requiring officer action", "info");
    });

    // Header Profile button opens login role modal
    document.getElementById("btn-admin-profile").addEventListener("click", () => {
        openModal("modal-login");
    });

    // Header Appearance Settings
    document.getElementById("btn-header-appearance").addEventListener("click", () => {
        openModal("modal-appearance");
    });

    // Calendar day cells selection
    document.querySelectorAll(".cal-day-cell").forEach(cell => {
        cell.addEventListener("click", () => {
            document.querySelectorAll(".cal-day-cell").forEach(c => c.classList.remove("active"));
            cell.classList.add("active");
            const dayNum = cell.querySelector(".cal-day-num").textContent;
            showToast(`Filtering scrutiny agenda for ${dayNum} October 2026`, "info");
        });
    });

    // View All Applications link in Dashboard
    const viewAllLink = document.getElementById("btn-view-all-apps-link");
    if (viewAllLink) {
        viewAllLink.addEventListener("click", () => switchView("applications"));
    }
}

// ================= DASHBOARD DATA MODULE =================
async function loadDashboard() {
    try {
        const res = await fetch("/api/dashboard/summary", { headers: getAuthHeaders() });
        if (!res.ok) return;
        const data = await res.json();

        // Update 4 Master KPI Tiles
        const totalEl = document.getElementById("gov-kpi-total");
        const reviewEl = document.getElementById("gov-kpi-review");
        const compliantEl = document.getElementById("gov-kpi-compliant");
        const issuesEl = document.getElementById("gov-kpi-issues");

        if (totalEl) totalEl.textContent = data.total_applications;
        if (reviewEl) reviewEl.textContent = data.pending_scrutiny;
        if (compliantEl) compliantEl.textContent = data.approved_applications;
        if (issuesEl) issuesEl.textContent = data.findings_by_severity.CRITICAL || 0;

        // Fetch application list to populate Recent Submissions table
        const appsRes = await fetch("/api/applications?limit=5", { headers: getAuthHeaders() });
        if (appsRes.ok) {
            const apps = await appsRes.json();
            state.applicationsCache = apps;
            renderDashboardRecentApps(apps);
        }

    } catch (e) {
        console.error("Dashboard data load error:", e);
    }
}

function renderDashboardRecentApps(apps) {
    const tbody = document.getElementById("dashboard-recent-apps-tbody");
    if (!tbody) return;

    if (!apps || apps.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No applications found.</td></tr>`;
        return;
    }

    tbody.innerHTML = apps.slice(0, 4).map(app => {
        const instName = app.institution ? app.institution.name.split(" ")[0] + " " + (app.institution.name.split(" ")[1] || "") : "Institute";
        let badgeClass = "badge-scrutiny";
        if (app.status === "DEFICIENCY_ISSUED" || app.status === "REJECTED") badgeClass = "badge-deficiency";
        if (app.status === "APPROVED") badgeClass = "badge-approved";
        if (app.status === "DRAFT") badgeClass = "badge-draft";

        return `
        <tr>
            <td><code><strong>${app.application_number}</strong></code></td>
            <td title="${app.institution ? app.institution.name : ''}">${instName}</td>
            <td><span class="badge-clean ${badgeClass}">${formatStatusLabel(app.status)}</span></td>
            <td>
                <button class="attention-btn btn-open-scrutiny-direct" data-id="${app.id}">
                    Scrutinize
                </button>
            </td>
        </tr>
        `;
    }).join("");

    attachDirectScrutinyHandlers();
}

function attachDirectScrutinyHandlers() {
    document.querySelectorAll(".btn-open-scrutiny-direct").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetRef = btn.getAttribute("data-id");
            // Check if it's a UUID or an application number
            if (targetRef.startsWith("APP-")) {
                const found = state.applicationsCache.find(a => a.application_number === targetRef);
                if (found) {
                    openScrutinyWorkspace(found.id);
                } else {
                    switchView("applications");
                }
            } else {
                openScrutinyWorkspace(targetRef);
            }
        });
    });
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
    tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 24px;">Loading applications...</td></tr>`;

    try {
        const res = await fetch(url, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to load applications");
        const apps = await res.json();
        state.applicationsCache = apps;

        if (apps.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted" style="padding: 24px;">No applications found matching query.</td></tr>`;
            return;
        }

        tbody.innerHTML = apps.map(app => {
            const instName = app.institution ? app.institution.name : "N/A";
            const instCode = app.institution ? app.institution.institution_code : "N/A";
            const subDate = app.submission_date ? app.submission_date.slice(0, 10) : "Draft";

            let badgeClass = "badge-scrutiny";
            if (app.status === "DEFICIENCY_ISSUED" || app.status === "REJECTED") badgeClass = "badge-deficiency";
            if (app.status === "APPROVED") badgeClass = "badge-approved";
            if (app.status === "DRAFT") badgeClass = "badge-draft";

            return `
            <tr>
                <td><code><strong>${app.application_number}</strong></code></td>
                <td><strong>${instName}</strong></td>
                <td><code>${instCode}</code></td>
                <td>${formatCategory(app.category)}</td>
                <td>${app.academic_year}</td>
                <td><span class="badge-clean ${badgeClass}">${formatStatusLabel(app.status)}</span></td>
                <td>${subDate}</td>
                <td>
                    <button class="btn-primary-action btn-inspect-app" data-id="${app.id}" style="height: 32px; padding: 0 12px; font-size: 12px;">
                        Scrutinize ➔
                    </button>
                </td>
            </tr>
            `;
        }).join("");

        document.querySelectorAll(".btn-inspect-app").forEach(b => {
            b.addEventListener("click", () => {
                const appId = b.getAttribute("data-id");
                openScrutinyWorkspace(appId);
            });
        });

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding: 24px; color: #A82424;">Error loading applications.</td></tr>`;
    }
}

// ================= SCRUTINY WORKSPACE MODULE =================
async function openScrutinyWorkspace(applicationId) {
    state.currentAppId = applicationId;
    switchView("scrutiny");

    try {
        const res = await fetch(`/api/applications/${applicationId}`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error("Failed to load application details");
        const app = await res.json();

        // Update Banner
        const inst = app.institution || {};
        document.getElementById("detail-inst-name").textContent = inst.name || "Higher Education Institution";
        document.getElementById("detail-inst-code").textContent = inst.institution_code || "N/A";
        document.getElementById("detail-app-num").textContent = app.application_number;
        document.getElementById("detail-app-category").textContent = formatCategory(app.category);
        document.getElementById("detail-app-year").textContent = app.academic_year;

        const statusEl = document.getElementById("detail-app-status");
        statusEl.className = `badge-clean ${app.status === 'DEFICIENCY_ISSUED' ? 'badge-deficiency' : 'badge-scrutiny'}`;
        statusEl.textContent = formatStatusLabel(app.status);

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
        <div class="editorial-card text-center" style="padding: 32px;">
            <h4 style="font-family: var(--font-heading); font-size: 18px; color: var(--color-roof-tile);">No Compliance Findings</h4>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Trigger the validation engine to run deterministic checks on this dossier.</p>
        </div>
        `;
        return;
    }

    container.innerHTML = findings.map(f => {
        const isCrit = f.severity === 'CRITICAL';
        const isMaj = f.severity === 'MAJOR';
        const cardClass = isCrit ? 'crit' : isMaj ? 'maj' : '';
        const badgeClass = isCrit ? 'badge-deficiency' : isMaj ? 'badge-scrutiny' : 'badge-draft';

        return `
        <div class="finding-item-card ${cardClass}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span class="badge-clean ${badgeClass}">${f.severity}</span>
                    <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">${f.rule_code} (v${f.rule_version})</span>
                    <span style="font-size: 11px; color: var(--text-muted);">${f.detection_method}</span>
                </div>
                <span class="badge-clean ${f.review_status === 'CONFIRMED' ? 'badge-deficiency' : 'badge-scrutiny'}">${f.review_status}</span>
            </div>

            <h4 class="finding-item-title">${f.title}</h4>
            <p class="finding-item-desc">${f.explanation}</p>

            ${f.evidence_text ? `
            <div class="evidence-quote-box">
                <span style="font-size: 10px; font-weight: 700; color: var(--color-bath-green); display: block; margin-bottom: 2px;">EVIDENCE SNIPPET:</span>
                ${escapeHtml(f.evidence_text)}
            </div>
            ` : ''}

            ${f.reviewer_notes ? `
            <div style="background-color: rgba(15, 107, 111, 0.08); border-left: 3px solid var(--color-bath-green); padding: 8px 12px; font-size: 12px;">
                <strong>Officer Determination Note:</strong> ${escapeHtml(f.reviewer_notes)}
            </div>
            ` : ''}

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <span style="font-size: 12px; color: var(--color-havasupai); font-weight: 500;">
                    Action: ${f.recommended_action || 'Inspect physical files.'}
                </span>
                <button class="btn-secondary-action btn-review-finding" 
                    data-id="${f.id}" 
                    data-title="${escapeHtml(f.title)}" 
                    data-explanation="${escapeHtml(f.explanation)}"
                    data-status="${f.review_status}"
                    data-notes="${escapeHtml(f.reviewer_notes || '')}"
                    style="height: 32px; padding: 0 12px; font-size: 12px;">
                    Review Finding
                </button>
            </div>
        </div>
        `;
    }).join("");

    // Review Finding Modal Handlers
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
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 24px;">No statutory documents uploaded yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = documents.map(d => {
        const hashShort = d.sha256_hash.slice(0, 16) + "...";
        const modeBadge = d.is_scanned 
            ? `<span class="badge-clean badge-deficiency">Scanned (OCR)</span>`
            : `<span class="badge-clean badge-scrutiny">Digital PDF</span>`;

        return `
        <tr>
            <td><strong>${formatDocType(d.document_type)}</strong></td>
            <td>${d.original_filename}</td>
            <td><code title="${d.sha256_hash}" style="font-family: var(--font-mono); font-size: 12px;">${hashShort}</code></td>
            <td>${modeBadge}</td>
            <td>${d.page_count}</td>
            <td><span class="badge-clean badge-scrutiny">${d.processing_status}</span></td>
            <td>
                <div style="display: flex; gap: 6px;">
                    <button class="btn-secondary-action btn-inspect-doc" data-id="${d.id}" style="height: 30px; padding: 0 10px; font-size: 11px;">
                        Inspect
                    </button>
                    <a href="/api/documents/${d.id}/download" target="_blank" class="select-clean" style="text-decoration: none; display: inline-flex; align-items: center; padding: 4px 8px; font-size: 11px;" download="${d.original_filename}">
                        Download
                    </a>
                </div>
            </td>
        </tr>
        `;
    }).join("");

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
        <div class="editorial-card text-center" style="grid-column: 1 / -1; padding: 32px;">
            <h4 style="font-family: var(--font-heading); font-size: 18px; color: var(--color-roof-tile);">No Registry Records</h4>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Upload documents with certificate numbers to trigger simulated registry verification.</p>
        </div>
        `;
        return;
    }

    container.innerHTML = verifications.map(v => {
        const details = v.response_payload || {};
        return `
        <div class="editorial-card" style="padding: var(--space-16); gap: var(--space-8);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 700; color: var(--color-bath-green); font-size: 13px;">${v.adapter_name}</span>
                <span class="badge-clean ${v.status === 'VERIFIED' ? 'badge-approved' : 'badge-deficiency'}">${v.status}</span>
            </div>
            <div style="font-size: 12px; margin-top: 4px;">
                <span style="color: var(--text-muted); font-size: 11px;">REGISTRY REFERENCE:</span>
                <div style="font-weight: 600; font-family: var(--font-mono);">${v.external_reference || 'N/A'}</div>
            </div>
            <div style="background-color: var(--color-sparkling-snow); padding: 8px 10px; border-radius: var(--radius-sm); font-size: 12px; margin-top: 4px;">
                <div><strong>Entity:</strong> ${details.registered_name || 'N/A'}</div>
                <div><strong>Cycle:</strong> ${details.validity || details.valid_till || details.academic_year || 'Active'}</div>
                <div style="color: var(--text-muted); font-size: 10px; margin-top: 4px; font-style: italic;">${details.disclaimer || ''}</div>
            </div>
        </div>
        `;
    }).join("");
}

// ================= DOCUMENT EXTRACTION INSPECTOR MODAL =================
async function openDocumentInspector(docId) {
    state.currentDocForInspector = docId;
    openModal("modal-extraction-inspector");

    const fieldsList = document.getElementById("inspector-fields-list");
    fieldsList.innerHTML = `<div class="text-center" style="padding: 20px; color: var(--text-muted);">Loading extracted entities...</div>`;

    try {
        const res = await fetch(`/api/documents/${docId}`, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to load document");
        const doc = await res.json();

        document.getElementById("inspector-doc-title").textContent = `Extraction: ${doc.original_filename}`;
        document.getElementById("inspector-doc-meta").textContent = `MIME: ${doc.mime_type} | Mode: ${doc.is_scanned ? 'Scanned OCR' : 'Digital PDF'} | Pages: ${doc.page_count}`;

        if (!doc.extracted_fields || doc.extracted_fields.length === 0) {
            fieldsList.innerHTML = `<div class="text-muted text-sm" style="padding: 16px;">No structured entities extracted from this document text.</div>`;
            return;
        }

        fieldsList.innerHTML = doc.extracted_fields.map(f => {
            const confPct = Math.round(f.confidence * 100);
            return `
            <div style="background-color: var(--color-sparkling-snow); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px 12px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <span style="font-family: var(--font-mono); font-weight: 700; color: var(--color-bath-green); font-size: 12px;">${f.field_name}</span>
                    <span style="font-size: 11px; color: var(--text-muted);">P.${f.source_page} | ${confPct}%</span>
                </div>
                <div style="font-size: 13px; font-weight: 600; color: var(--color-roof-tile);">${escapeHtml(f.normalized_value || f.extracted_value || 'None')}</div>
                ${f.raw_text_snippet ? `<div style="font-size: 11px; color: var(--text-muted); font-style: italic; margin-top: 3px;">"${escapeHtml(f.raw_text_snippet)}"</div>` : ''}
                ${f.reviewer_corrected_value ? `<div class="badge-clean badge-approved" style="margin-top: 4px;">Officer Overridden</div>` : ''}
            </div>
            `;
        }).join("");

    } catch (e) {
        fieldsList.innerHTML = `<div style="padding: 16px; color: #A82424;">Failed to load extraction details.</div>`;
    }
}

// ================= COMPLIANCE RULES PANEL =================
async function loadRules() {
    const tbody = document.getElementById("rules-tbody");
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 24px;">Loading compliance rules...</td></tr>`;

    try {
        const res = await fetch("/api/rules", { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to load rules");
        const rules = await res.json();

        tbody.innerHTML = rules.map(r => {
            const isCrit = r.severity === 'CRITICAL';
            const badgeClass = isCrit ? 'badge-deficiency' : 'badge-scrutiny';
            const statusText = r.is_enabled ? 'Disable' : 'Enable';

            return `
            <tr>
                <td><code><strong>${r.rule_code}</strong></code></td>
                <td><span class="badge-clean badge-draft">v${r.version}</span></td>
                <td>
                    <div style="font-weight: 600; color: var(--color-roof-tile);">${r.title}</div>
                    <div style="font-size: 12px; color: var(--text-muted); max-width: 420px;">${r.description}</div>
                </td>
                <td><span class="badge-clean badge-draft">${r.category}</span></td>
                <td><span class="badge-clean ${badgeClass}">${r.severity}</span></td>
                <td><span class="badge-clean ${r.is_enabled ? 'badge-approved' : 'badge-draft'}">${r.is_enabled ? 'Active' : 'Disabled'}</span></td>
                <td>
                    <button class="btn-secondary-action btn-toggle-rule" data-code="${r.rule_code}" data-enabled="${r.is_enabled}" style="height: 30px; padding: 0 10px; font-size: 11px;">
                        ${statusText}
                    </button>
                </td>
            </tr>
            `;
        }).join("");

        document.querySelectorAll(".btn-toggle-rule").forEach(b => {
            b.addEventListener("click", async () => {
                const code = b.getAttribute("data-code");
                const currentEnabled = b.getAttribute("data-enabled") === "true";
                await toggleRule(code, !currentEnabled);
            });
        });

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 24px; color: #A82424;">Error loading compliance rules.</td></tr>`;
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
            showToast(err.detail || "Only administrators can configure regulatory rules", "error");
            return;
        }
        showToast(`Rule '${ruleCode}' state updated to ${newEnabledState ? 'Active' : 'Disabled'}`, "success");
        loadRules();
    } catch (e) {
        showToast("Error updating rule state", "error");
    }
}

// ================= AUDIT TRAIL MODULE =================
async function loadAuditTrail() {
    const tbody = document.getElementById("audit-tbody");
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 24px;">Loading audit events...</td></tr>`;

    try {
        const res = await fetch("/api/audit?limit=100", { headers: getAuthHeaders() });
        if (!res.ok) throw new Error("Failed to load audit events");
        const events = await res.json();

        if (events.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted" style="padding: 24px;">No audit events recorded.</td></tr>`;
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
                <td><span class="badge-clean badge-draft">${e.resource_type}</span></td>
                <td><code>${e.resource_id ? e.resource_id.slice(0, 12) + '...' : 'N/A'}</code></td>
                <td><code>${e.ip_address}</code></td>
                <td><small style="font-family: var(--font-mono); font-size: 11px;">${escapeHtml(detailsJson)}</small></td>
            </tr>
            `;
        }).join("");

    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding: 24px; color: #A82424;">Failed to load audit trail.</td></tr>`;
    }
}

// ================= FORMS & MUTATION ACTIONS =================
function initForms() {
    // 1. Validation Engine Trigger
    document.getElementById("btn-trigger-validation").addEventListener("click", async () => {
        if (!state.currentAppId) return;
        const btn = document.getElementById("btn-trigger-validation");
        btn.textContent = "⏳ Validating Dossier...";
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
            showToast("Error executing validation", "error");
        } finally {
            btn.textContent = "⚡ Run Validation Engine";
            btn.disabled = false;
        }
    });

    // 2. Status Transition Action
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
            showToast("Error updating status", "error");
        }
    });

    // 3. Document Upload Form
    document.getElementById("form-upload-doc").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!state.currentAppId) return;

        const docType = document.getElementById("upload-doc-type").value;
        const fileInput = document.getElementById("upload-file-input");
        if (!fileInput.files || fileInput.files.length === 0) {
            showToast("Please select a statutory document file", "error");
            return;
        }

        const submitBtn = document.getElementById("btn-submit-upload");
        submitBtn.textContent = "Ingesting...";
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
                showToast(err.detail || "Upload failed", "error");
                return;
            }

            const doc = await res.json();
            showToast(`Document ingested: ${doc.original_filename} (SHA-256 validated)`, "success");
            fileInput.value = "";
            openScrutinyWorkspace(state.currentAppId);
        } catch (err) {
            showToast("Error uploading document", "error");
        } finally {
            submitBtn.textContent = "Ingest & Verify";
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
                showToast(err.detail || "Override failed", "error");
                return;
            }

            showToast(`Field '${fieldName}' corrected. Re-run validation to test consistency.`, "success");
            openDocumentInspector(state.currentDocForInspector);
        } catch (e) {
            showToast("Error saving field correction", "error");
        }
    });

    // 5. Finding Determination Review Form
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
                showToast(err.detail || "Update failed", "error");
                return;
            }

            closeModal("modal-finding-review");
            showToast("Determination saved in immutable audit record.", "success");
            openScrutinyWorkspace(state.currentAppId);
        } catch (e) {
            showToast("Error updating determination", "error");
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

    // Role Picker Pills in Login Modal
    document.querySelectorAll(".role-picker-pill").forEach(p => {
        p.addEventListener("click", () => {
            document.querySelectorAll(".role-picker-pill").forEach(x => x.classList.remove("active"));
            p.classList.add("active");
            document.getElementById("login-username").value = p.getAttribute("data-user");
            document.getElementById("login-password").value = p.getAttribute("data-pass");
        });
    });

    // Filter Controls
    document.getElementById("btn-apply-filters").addEventListener("click", () => loadApplications());
    document.getElementById("btn-reset-filters").addEventListener("click", () => {
        document.getElementById("app-search-input").value = "";
        document.getElementById("filter-app-category").value = "";
        document.getElementById("filter-app-status").value = "";
        loadApplications();
    });

    // Refresh Audit Log
    document.getElementById("btn-refresh-audit").addEventListener("click", () => loadAuditTrail());
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

// ================= MODAL CONTROLLERS =================
function initModals() {
    document.getElementById("btn-close-new-app-modal").onclick = () => closeModal("modal-new-app");
    document.getElementById("btn-cancel-new-app").onclick = () => closeModal("modal-new-app");
    document.getElementById("btn-open-create-app-modal").onclick = () => openNewAppModal();

    document.getElementById("btn-close-inspector").onclick = () => closeModal("modal-extraction-inspector");
    document.getElementById("btn-close-review-modal").onclick = () => closeModal("modal-finding-review");
    document.getElementById("btn-cancel-review").onclick = () => closeModal("modal-finding-review");
    document.getElementById("btn-close-login").onclick = () => closeModal("modal-login");
    document.getElementById("btn-close-appearance").onclick = () => closeModal("modal-appearance");
}

function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add("open");
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove("open");
}

// ================= CUSTOMIZATION & APPEARANCE SETTINGS =================
function initAppearanceSettings() {
    const lightBtn = document.getElementById("theme-set-light");
    const darkBtn = document.getElementById("theme-set-dark");
    const densitySelect = document.getElementById("setting-table-density");
    const sidebarSelect = document.getElementById("setting-sidebar-mode");
    const saveBtn = document.getElementById("btn-save-appearance");

    // Load saved settings
    const savedTheme = localStorage.getItem("aicte_theme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    }

    const savedDensity = localStorage.getItem("aicte_density") || "compact";
    if (densitySelect) densitySelect.value = savedDensity;

    lightBtn.addEventListener("click", () => {
        document.body.classList.remove("dark-theme");
        localStorage.setItem("aicte_theme", "light");
        showToast("Government Light theme active", "info");
    });

    darkBtn.addEventListener("click", () => {
        document.body.classList.add("dark-theme");
        localStorage.setItem("aicte_theme", "dark");
        showToast("High-contrast Dark theme active", "info");
    });

    saveBtn.addEventListener("click", () => {
        const dens = densitySelect.value;
        localStorage.setItem("aicte_density", dens);

        const sbMode = sidebarSelect.value;
        const sbEl = document.getElementById("app-sidebar");
        if (sbMode === "condensed") {
            sbEl.style.width = "72px";
            document.querySelectorAll(".sidebar-label").forEach(l => l.style.display = "none");
            document.querySelectorAll(".sidebar-tagline").forEach(t => t.style.display = "none");
        } else {
            sbEl.style.width = "176px";
            document.querySelectorAll(".sidebar-label").forEach(l => l.style.display = "inline");
            document.querySelectorAll(".sidebar-tagline").forEach(t => t.style.display = "block");
        }

        closeModal("modal-appearance");
        showToast("Display preferences applied", "success");
    });
}

// ================= UTILITIES & HELPERS =================
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 250);
    }, 3500);
}

function formatStatusLabel(st) {
    if (!st) return "";
    return st.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatCategory(cat) {
    if (!cat) return "";
    return cat.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatDocType(type) {
    if (!type) return "";
    return type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
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
