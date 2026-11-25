(() => {
  const STORAGE_KEYS = {
    PROJECTS: "wind_lab_projects_v2",
    EMPLOYEES: "wind_lab_employees_v2",
    THEME: "wind_lab_theme_v2"
  };

  const LANG_COLORS = {
    JavaScript: "#f1e05a",
    GDScript: "#355570",
    JASS: "#cf4b36",
    Shell: "#89e051",
    Python: "#3572A5",
    Markdown: "#0abab5"
  };

  let projects = loadState(STORAGE_KEYS.PROJECTS, window.DEFAULT_PROJECTS);
  let employees = loadState(STORAGE_KEYS.EMPLOYEES, window.DEFAULT_EMPLOYEES);
  let activeView = "projects";
  let categoryFilter = "all";
  let employeeFilter = "all";
  let entryTypeFilter = "all";
  let sortBy = "updated";
  let searchQuery = "";
  let inspectingProjectId = null;

  const $ = (id) => document.getElementById(id);
  const els = {
    globalSearch: $("globalSearch"),
    clearSearchBtn: $("clearSearchBtn"),
    projectsGrid: $("projectsGrid"),
    emptyState: $("emptyState"),
    entriesDirectory: $("entriesDirectory"),
    employeesGrid: $("employeesGrid"),
    employeeSelect: $("employeeSelect"),
    sortSelect: $("sortSelect"),
    statTotal: $("statTotal"),
    statLive: $("statLive"),
    statGame: $("statGame"),
    statEmployees: $("statEmployees"),
    spotlightOverlay: $("spotlightOverlay"),
    spotlightInput: $("spotlightInput"),
    spotlightResults: $("spotlightResults"),
    projectModalOverlay: $("projectModalOverlay"),
    addProjectOverlay: $("addProjectOverlay"),
    addEmployeeOverlay: $("addEmployeeOverlay"),
    toast: $("toast")
  };

  function loadState(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return structuredClone(fallback);
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.remove("hidden");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => els.toast.classList.add("hidden"), 2600);
  }

  function getEmployee(id) {
    return employees.find((e) => e.id === id) || employees[0] || { id: "unknown", name: "未指派", github: "" };
  }

  function buildProjectEntries(proj) {
    const entries = [];
    if (proj.liveUrl) {
      entries.push({ type: "live", label: "Live 線上網站", url: proj.liveUrl, icon: "✦" });
    }
    if (proj.repoUrl) {
      const base = proj.repoUrl.replace(/\/$/, "");
      entries.push({ type: "repo", label: "Repo 程式碼", url: base, icon: "⌥" });
      entries.push({ type: "issues", label: "Issues 追蹤", url: `${base}/issues`, icon: "◎" });
      entries.push({ type: "pulls", label: "Pull Requests", url: `${base}/pulls`, icon: "⇄" });
      entries.push({ type: "actions", label: "Actions 自動化", url: `${base}/actions`, icon: "⚡" });
      entries.push({ type: "pages", label: "Pages 部署設定", url: `${base}/settings/pages`, icon: "◈" });
      entries.push({ type: "insights", label: "Insights 分析", url: `${base}/pulse`, icon: "◔" });
      entries.push({ type: "settings", label: "Settings 設定", url: `${base}/settings`, icon: "⚙" });
      entries.push({ type: "collaborators", label: "成員權限", url: `${base}/settings/access`, icon: "👥" });
    }
    return entries;
  }

  function getFilteredProjects() {
    const q = searchQuery.trim().toLowerCase();
    return projects
      .filter((p) => {
        if (categoryFilter === "live" && !p.liveUrl) return false;
        if (["art3d", "game", "tools"].includes(categoryFilter) && p.collection !== categoryFilter) return false;
        if (employeeFilter !== "all" && p.employeeId !== employeeFilter) return false;
        if (!q) return true;

        const emp = getEmployee(p.employeeId);
        const entriesText = buildProjectEntries(p).map((e) => e.label).join(" ");
        const haystack = [
          p.name,
          p.displayName,
          p.collectionLabel,
          p.description,
          p.language,
          p.status,
          (p.tags || []).join(" "),
          emp.name,
          emp.github,
          entriesText
        ].join(" ").toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "status") {
          const order = { Live: 0, Active: 1, Private: 2, Archived: 3 };
          return (order[a.status] ?? 9) - (order[b.status] ?? 9);
        }
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      });
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return "";
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
  }

  function renderStats() {
    els.statTotal.textContent = projects.length;
    els.statLive.textContent = projects.filter((p) => !!p.liveUrl).length;
    els.statGame.textContent = projects.filter((p) => p.collection === "game").length;
    els.statEmployees.textContent = employees.length;
  }

  function renderEmployeeDropdowns() {
    const options = employees.map((e) => `<option value="${escapeHtml(e.id)}">${escapeHtml(e.name)}</option>`).join("");
    els.employeeSelect.innerHTML = `<option value="all">所有創作者</option>${options}`;
    els.employeeSelect.value = employeeFilter;
    $("newProjectEmployeeSelect").innerHTML = options;
    $("modalEmployeeSelect").innerHTML = options;
  }

  function renderProjects() {
    const list = getFilteredProjects();
    if (!list.length) {
      els.projectsGrid.innerHTML = "";
      els.emptyState.classList.remove("hidden");
      return;
    }
    els.emptyState.classList.add("hidden");

    els.projectsGrid.innerHTML = list.map((proj) => {
      const emp = getEmployee(proj.employeeId);
      const entries = buildProjectEntries(proj);
      const langColor = LANG_COLORS[(proj.language || "").split(" ")[0]] || "#0abab5";
      const avatarHtml = emp.avatar
        ? `<img src="${escapeHtml(emp.avatar)}" alt="${escapeHtml(emp.name)}" />`
        : escapeHtml(emp.name.slice(0, 1).toUpperCase());

      const quickEntries = entries.filter((e) => ["live", "repo", "issues", "actions", "settings"].includes(e.type)).slice(0, 4);

      return `
        <article class="project-card" data-id="${escapeHtml(proj.id)}">
          <div class="card-top">
            <div class="card-title-group">
              <span class="collection-label">${escapeHtml(proj.collectionLabel || "GITHUB COLLECTION")}</span>
              <h3 class="project-name" data-open-modal="${escapeHtml(proj.id)}">${escapeHtml(proj.displayName || proj.name)}</h3>
              <span class="repo-slug">spencer384 / ${escapeHtml(proj.name)}</span>
            </div>
            <span class="status-badge status-${escapeHtml(proj.status)}">${escapeHtml(proj.status)}</span>
          </div>

          <p class="card-desc">${escapeHtml(proj.description || "尚無專案描述")}</p>

          <div class="card-meta">
            <button class="employee-chip" data-filter-emp="${escapeHtml(emp.id)}" title="篩選此成員的專案">
              <span class="avatar-dot">${avatarHtml}</span>
              <span>${escapeHtml(emp.name)}</span>
            </button>
            <div style="display:flex;align-items:center;gap:10px;">
              ${proj.language ? `<span class="lang-tag"><span class="lang-dot" style="background:${langColor}"></span>${escapeHtml(proj.language)}</span>` : ""}
              <span>${formatDate(proj.updatedAt)}</span>
            </div>
          </div>

          <div class="card-entries">
            <button class="entry-pill primary-entry" data-open-modal="${escapeHtml(proj.id)}">◆ 管理中心</button>
            ${quickEntries.map((entry) => {
              const cls = entry.type === "live" ? "entry-pill live-entry" : "entry-pill";
              return `<a class="${cls}" href="${escapeHtml(entry.url)}" target="_blank" rel="noopener">${entry.icon} ${escapeHtml(entry.label)}</a>`;
            }).join("")}
          </div>
        </article>
      `;
    }).join("");
  }

  function renderEntriesDirectory() {
    const list = getFilteredProjects();
    els.entriesDirectory.innerHTML = list.map((proj) => {
      const emp = getEmployee(proj.employeeId);
      const entries = buildProjectEntries(proj).filter((e) => entryTypeFilter === "all" || e.type === entryTypeFilter);
      if (!entries.length) return "";
      return `
        <div class="directory-row">
          <div class="directory-project-info">
            <span class="directory-project-name">${escapeHtml(proj.displayName || proj.name)}</span>
            <span class="directory-project-sub">${escapeHtml(proj.name)} · ${escapeHtml(proj.collectionLabel || "")} · ${escapeHtml(emp.name)}</span>
          </div>
          <div class="directory-links">
            <button class="entry-pill primary-entry" data-open-modal="${escapeHtml(proj.id)}">◆ 管理面板</button>
            ${entries.map((entry) => {
              const cls = entry.type === "live" ? "entry-pill live-entry" : "entry-pill";
              return `<a class="${cls}" href="${escapeHtml(entry.url)}" target="_blank" rel="noopener">${entry.icon} ${escapeHtml(entry.label)}</a>`;
            }).join("")}
          </div>
        </div>
      `;
    }).join("") || `<div class="empty-state"><h3>沒有符合的管理入口</h3></div>`;
  }

  function renderEmployees() {
    els.employeesGrid.innerHTML = employees.map((emp) => {
      const owned = projects.filter((p) => p.employeeId === emp.id);
      const liveCount = owned.filter((p) => !!p.liveUrl).length;
      const avatarHtml = emp.avatar
        ? `<img src="${escapeHtml(emp.avatar)}" alt="${escapeHtml(emp.name)}" />`
        : escapeHtml(emp.name.slice(0, 1).toUpperCase());

      return `
        <div class="employee-card">
          <div class="employee-card-head">
            <div class="employee-avatar-lg">${avatarHtml}</div>
            <div class="employee-info">
              <h3>${escapeHtml(emp.name)}</h3>
              <p>${escapeHtml(emp.role || "Developer")} · @${escapeHtml(emp.github || "local")}</p>
            </div>
          </div>
          <div style="font-size:12.5px;color:var(--text-secondary)">所屬：${escapeHtml(emp.department || "風的異想實驗室")}</div>
          <div class="employee-stats-row">
            <span>負責專案：<strong>${owned.length}</strong> 個</span>
            <span>Live 網站：<strong>${liveCount}</strong> 個</span>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary btn-sm" style="flex:1;justify-content:center;" data-filter-emp="${escapeHtml(emp.id)}">查看負責專案</button>
            ${emp.github ? `<a class="btn btn-ghost btn-sm" href="https://github.com/${encodeURIComponent(emp.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : ""}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderAll() {
    renderStats();
    renderEmployeeDropdowns();
    if (activeView === "projects") renderProjects();
    if (activeView === "entries") renderEntriesDirectory();
    if (activeView === "employees") renderEmployees();
  }

  function switchView(view) {
    activeView = view;
    document.querySelectorAll(".seg-btn").forEach((btn) => {
      const isAct = btn.dataset.view === view;
      btn.classList.toggle("active", isAct);
      btn.setAttribute("aria-selected", String(isAct));
    });
    $("projectsView").classList.toggle("hidden", view !== "projects");
    $("entriesView").classList.toggle("hidden", view !== "entries");
    $("employeesView").classList.toggle("hidden", view !== "employees");
    renderAll();
  }

  function openProjectModal(projectId) {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    inspectingProjectId = projectId;

    $("modalCategoryBadge").textContent = proj.collectionLabel || "GitHub";
    $("modalProjectTitle").textContent = proj.displayName || proj.name;
    $("modalProjectDesc").textContent = proj.description || "尚無專案描述";
    $("modalEmployeeSelect").value = proj.employeeId;
    $("modalStatusSelect").value = proj.status;
    $("modalEntrySearch").value = "";

    renderModalEntries(proj, "");
    els.projectModalOverlay.classList.remove("hidden");
  }

  function renderModalEntries(proj, q) {
    const entries = buildProjectEntries(proj).filter((e) => !q || e.label.toLowerCase().includes(q.toLowerCase()));
    $("modalEntriesList").innerHTML = entries.map((entry) =>
      `<a class="modal-entry-card" href="${escapeHtml(entry.url)}" target="_blank" rel="noopener"><span>${entry.icon} ${escapeHtml(entry.label)}</span><span>↗</span></a>`
    ).join("") || `<p style="color:var(--text-secondary);font-size:13px;">找不到符合的管理入口</p>`;
  }

  function openSpotlight() {
    els.spotlightOverlay.classList.remove("hidden");
    els.spotlightInput.value = searchQuery;
    renderSpotlightResults(searchQuery);
    setTimeout(() => els.spotlightInput.focus(), 30);
  }

  function renderSpotlightResults(q) {
    const query = q.trim().toLowerCase();
    const items = [];

    projects.forEach((proj) => {
      const emp = getEmployee(proj.employeeId);
      const entries = buildProjectEntries(proj);
      const matchProj = !query || [proj.name, proj.displayName, proj.collectionLabel, proj.language, emp.name].join(" ").toLowerCase().includes(query);

      if (matchProj) {
        items.push({
          title: `${proj.displayName || proj.name}`,
          sub: `${proj.name} · ${proj.collectionLabel || ""} · 開啟專案管理中心`,
          tag: "管理中心",
          action: () => {
            els.spotlightOverlay.classList.add("hidden");
            openProjectModal(proj.id);
          }
        });
      }

      entries.forEach((entry) => {
        const hay = `${proj.name} ${proj.displayName} ${entry.label} ${entry.type}`.toLowerCase();
        if (query && hay.includes(query)) {
          items.push({
            title: `${proj.name} → ${entry.label}`,
            sub: entry.url,
            tag: entry.type.toUpperCase(),
            url: entry.url
          });
        }
      });
    });

    const slice = items.slice(0, 14);
    if (!slice.length) {
      els.spotlightResults.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-secondary);font-size:13.5px;">找不到符合「${escapeHtml(q)}」的專案或管理入口</div>`;
      return;
    }

    els.spotlightResults.innerHTML = slice.map((item, idx) => {
      if (item.url) {
        return `<a class="spotlight-item" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
          <div class="spotlight-item-left"><span class="spotlight-item-title">${escapeHtml(item.title)}</span><span class="spotlight-item-sub">${escapeHtml(item.sub)}</span></div>
          <span class="spotlight-tag">${escapeHtml(item.tag)} ↗</span>
        </a>`;
      }
      return `<div class="spotlight-item" data-spot-idx="${idx}">
        <div class="spotlight-item-left"><span class="spotlight-item-title">${escapeHtml(item.title)}</span><span class="spotlight-item-sub">${escapeHtml(item.sub)}</span></div>
        <span class="spotlight-tag">${escapeHtml(item.tag)}</span>
      </div>`;
    }).join("");

    els.spotlightResults.querySelectorAll("[data-spot-idx]").forEach((el) => {
      const item = slice[Number(el.dataset.spotIdx)];
      el.addEventListener("click", () => item.action && item.action());
    });
  }

  async function syncFromGitHub() {
    const btn = $("syncGithubBtn");
    btn.disabled = true;
    btn.querySelector("span").textContent = "同步中...";
    try {
      const res = await fetch("https://api.github.com/users/spencer384/repos?per_page=100&sort=updated");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const repos = await res.json();
      let added = 0;
      let updated = 0;

      repos.forEach((repo) => {
        if (repo.name.toLowerCase() === "spencer384.github.io") return;
        const existing = projects.find((p) => p.name.toLowerCase() === repo.name.toLowerCase());
        const liveUrl = repo.has_pages ? `https://spencer384.github.io/${repo.name}/` : (repo.homepage || "");
        if (existing) {
          existing.updatedAt = repo.updated_at;
          if (repo.language) existing.language = repo.language;
          if (liveUrl && !existing.liveUrl) existing.liveUrl = liveUrl;
          updated++;
        } else {
          projects.unshift({
            id: `proj-gh-${repo.id}`,
            name: repo.name,
            displayName: repo.name,
            collection: "tools",
            collectionLabel: "GitHub 收錄",
            description: repo.description || "從 GitHub 自動同步的儲存庫專案。",
            employeeId: "emp-spencer",
            status: repo.has_pages ? "Live" : "Active",
            language: repo.language || "Other",
            repoUrl: repo.html_url,
            liveUrl,
            updatedAt: repo.updated_at,
            tags: ["GitHub Sync"]
          });
          added++;
        }
      });

      saveState();
      renderAll();
      showToast(`已與 GitHub 同步：更新 ${updated} 個，新增 ${added} 個專案`);
    } catch (err) {
      showToast(`GitHub 同步失敗：${err.message}`);
    } finally {
      btn.disabled = false;
      btn.querySelector("span").textContent = "同步 GitHub";
    }
  }

  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // Event Listeners
  els.globalSearch.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    els.clearSearchBtn.classList.toggle("hidden", !searchQuery);
    renderAll();
  });

  els.clearSearchBtn.addEventListener("click", () => {
    searchQuery = "";
    els.globalSearch.value = "";
    els.clearSearchBtn.classList.add("hidden");
    renderAll();
  });

  document.querySelectorAll(".seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });

  $("categoryFilters").addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    categoryFilter = btn.dataset.filter;
    document.querySelectorAll("#categoryFilters .pill").forEach((p) => p.classList.toggle("active", p === btn));
    renderAll();
  });

  $("entryTypePills").addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    entryTypeFilter = btn.dataset.entryType;
    document.querySelectorAll("#entryTypePills .pill").forEach((p) => p.classList.toggle("active", p === btn));
    renderEntriesDirectory();
  });

  document.querySelectorAll("[data-quick-filter]").forEach((card) => {
    card.addEventListener("click", () => {
      switchView("projects");
      categoryFilter = card.dataset.quickFilter;
      document.querySelectorAll("#categoryFilters .pill").forEach((p) => p.classList.toggle("active", p.dataset.filter === categoryFilter));
      renderProjects();
    });
  });

  $("openEmployeeTabCard").addEventListener("click", () => switchView("employees"));

  els.employeeSelect.addEventListener("change", (e) => {
    employeeFilter = e.target.value;
    renderAll();
  });

  els.sortSelect.addEventListener("change", (e) => {
    sortBy = e.target.value;
    renderAll();
  });

  $("resetFiltersBtn").addEventListener("click", () => {
    searchQuery = "";
    categoryFilter = "all";
    employeeFilter = "all";
    els.globalSearch.value = "";
    els.clearSearchBtn.classList.add("hidden");
    document.querySelectorAll("#categoryFilters .pill").forEach((p) => p.classList.toggle("active", p.dataset.filter === "all"));
    renderAll();
  });

  document.body.addEventListener("click", (e) => {
    const modalBtn = e.target.closest("[data-open-modal]");
    if (modalBtn) {
      openProjectModal(modalBtn.dataset.openModal);
      return;
    }
    const empBtn = e.target.closest("[data-filter-emp]");
    if (empBtn) {
      employeeFilter = empBtn.dataset.filterEmp;
      switchView("projects");
    }
  });

  $("closeProjectModalBtn").addEventListener("click", () => els.projectModalOverlay.classList.add("hidden"));
  $("modalEntrySearch").addEventListener("input", (e) => {
    const proj = projects.find((p) => p.id === inspectingProjectId);
    if (proj) renderModalEntries(proj, e.target.value);
  });

  $("saveProjectChangesBtn").addEventListener("click", () => {
    const proj = projects.find((p) => p.id === inspectingProjectId);
    if (!proj) return;
    proj.employeeId = $("modalEmployeeSelect").value;
    proj.status = $("modalStatusSelect").value;
    saveState();
    els.projectModalOverlay.classList.add("hidden");
    renderAll();
    showToast("已儲存專案設定");
  });

  $("deleteProjectBtn").addEventListener("click", () => {
    projects = projects.filter((p) => p.id !== inspectingProjectId);
    saveState();
    els.projectModalOverlay.classList.add("hidden");
    renderAll();
    showToast("已移除該專案");
  });

  $("addProjectBtn").addEventListener("click", () => {
    renderEmployeeDropdowns();
    els.addProjectOverlay.classList.remove("hidden");
  });
  $("closeAddProjectBtn").addEventListener("click", () => els.addProjectOverlay.classList.add("hidden"));
  $("cancelAddProjectBtn").addEventListener("click", () => els.addProjectOverlay.classList.add("hidden"));
  $("addProjectForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name").trim();
    const displayName = fd.get("displayName").trim() || name;
    const collection = fd.get("collection");
    const collectionMap = { art3d: "3D 數位藝術", game: "遊戲與地圖", tools: "工具與系統" };
    const repoUrl = fd.get("repoUrl").trim();
    const liveUrl = fd.get("liveUrl").trim();
    projects.unshift({
      id: `proj-${Date.now()}`,
      name,
      displayName,
      collection,
      collectionLabel: collectionMap[collection] || "GitHub",
      description: fd.get("description").trim() || "實驗室新建專案",
      employeeId: fd.get("employeeId"),
      status: liveUrl ? "Live" : "Active",
      language: fd.get("language").trim() || "Web",
      repoUrl,
      liveUrl,
      updatedAt: new Date().toISOString(),
      tags: ["New"]
    });
    saveState();
    e.target.reset();
    els.addProjectOverlay.classList.add("hidden");
    switchView("projects");
    showToast(`已收錄專案：${displayName}`);
  });

  $("addEmployeeBtn").addEventListener("click", () => els.addEmployeeOverlay.classList.remove("hidden"));
  $("closeAddEmployeeBtn").addEventListener("click", () => els.addEmployeeOverlay.classList.add("hidden"));
  $("cancelAddEmployeeBtn").addEventListener("click", () => els.addEmployeeOverlay.classList.add("hidden"));
  $("addEmployeeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name").trim();
    employees.push({
      id: `emp-${Date.now()}`,
      name,
      github: fd.get("github").trim(),
      role: fd.get("role").trim() || "Member",
      department: fd.get("department").trim() || "風的異想實驗室",
      avatar: ""
    });
    saveState();
    e.target.reset();
    els.addEmployeeOverlay.classList.add("hidden");
    renderAll();
    showToast(`已新增成員：${name}`);
  });

  $("syncGithubBtn").addEventListener("click", syncFromGitHub);
  $("exportDataBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ projects, employees }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wind-whimsical-lab-backup.json";
    a.click();
  });
  $("importDataInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (Array.isArray(parsed.projects) && Array.isArray(parsed.employees)) {
          projects = parsed.projects;
          employees = parsed.employees;
          saveState();
          renderAll();
          showToast("已成功匯入備份");
        }
      } catch {
        showToast("JSON 格式錯誤");
      }
    };
    reader.readAsText(file);
  });
  $("resetDefaultBtn").addEventListener("click", () => {
    projects = structuredClone(window.DEFAULT_PROJECTS);
    employees = structuredClone(window.DEFAULT_EMPLOYEES);
    saveState();
    renderAll();
    showToast("已還原為預設典藏專案");
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    $("themeIconSun").classList.toggle("hidden", theme !== "dark");
    $("themeIconMoon").classList.toggle("hidden", theme === "dark");
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }
  applyTheme(localStorage.getItem(STORAGE_KEYS.THEME) || "light");
  $("themeToggleBtn").addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  $("openPaletteHint").addEventListener("click", openSpotlight);
  els.spotlightInput.addEventListener("input", (e) => renderSpotlightResults(e.target.value));
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openSpotlight();
    } else if (e.key === "Escape") {
      els.spotlightOverlay.classList.add("hidden");
      els.projectModalOverlay.classList.add("hidden");
      els.addProjectOverlay.classList.add("hidden");
      els.addEmployeeOverlay.classList.add("hidden");
    }
  });

  [els.spotlightOverlay, els.projectModalOverlay, els.addProjectOverlay, els.addEmployeeOverlay].forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.add("hidden");
    });
  });

  renderAll();
})();
