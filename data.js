// 風的異想實驗室 — 創作者與團隊名單
window.DEFAULT_EMPLOYEES = [
  {
    id: "emp-spencer",
    name: "Spencer (spencer384)",
    github: "spencer384",
    role: "實驗室主理人 · Lead Architect",
    department: "風的異想實驗室",
    avatar: "https://avatars.githubusercontent.com/u/132677738?v=4",
    isAdmin: true
  },
  {
    id: "emp-github-admin",
    name: "GitHub 管理員",
    github: "spencer384",
    role: "GitHub Admin · 儲存庫與權限管理員",
    department: "平台維運與權限管理部",
    avatar: "",
    isAdmin: true,
    permissions: ["Repo 管理", "Issues / PR 審核", "Actions CI/CD", "Pages 部署", "成員權限"]
  }
];

// 整理自 GitHub (spencer384) 的所有專案
window.DEFAULT_PROJECTS = [
  {
    id: "proj-qianli-jiangshan",
    name: "qianli-jiangshan",
    displayName: "千里江山圖 · 數位長卷",
    collection: "art3d",
    collectionLabel: "3D 數位藝術",
    description: "宋代王希孟《千里江山圖》互動式 3D 數位長卷體驗，支援即時光影與卷軸瀏覽，已部署至 GitHub Pages。",
    employeeId: "emp-spencer",
    status: "Live",
    language: "JavaScript",
    repoUrl: "https://github.com/spencer384/qianli-jiangshan",
    liveUrl: "https://spencer384.github.io/qianli-jiangshan/",
    updatedAt: "2026-11-24T12:27:07Z",
    tags: ["Three.js", "GitHub Pages", "數位長卷"]
  },
  {
    id: "proj-qianli-jiangshan-mc",
    name: "qianli-jiangshan-mc",
    displayName: "千里江山圖 · Minecraft 體素版",
    collection: "art3d",
    collectionLabel: "3D 數位藝術",
    description: "將千里江山圖轉化為 Minecraft 體素方塊 3D 世界，具備地形生成與建築細節，已上線 GitHub Pages。",
    employeeId: "emp-spencer",
    status: "Live",
    language: "JavaScript",
    repoUrl: "https://github.com/spencer384/qianli-jiangshan-mc",
    liveUrl: "https://spencer384.github.io/qianli-jiangshan-mc/",
    updatedAt: "2026-11-25T11:55:12Z",
    tags: ["Voxel", "WebGL", "GitHub Pages"]
  },
  {
    id: "proj-qianli-jiangshan-real",
    name: "qianli-jiangshan-real",
    displayName: "江山千里 · 實景寫真卷 (3D-Real)",
    collection: "art3d",
    collectionLabel: "3D 數位藝術",
    description: "方琮《仿王希孟江山千里卷》全 17 段無縫拼接現實擬真長卷（24,960 × 1,080），支援原稿與實境上下同步對照瀏覽。",
    employeeId: "emp-spencer",
    status: "Live",
    language: "JavaScript",
    repoUrl: "https://github.com/spencer384/qianli-jiangshan-real",
    liveUrl: "https://spencer384.github.io/qianli-jiangshan-real/",
    updatedAt: "2026-11-26T10:55:00Z",
    tags: ["Photorealistic", "Panorama", "Full Scroll"]
  },
  {
    id: "proj-sky-island-diorama",
    name: "sky-island-diorama",
    displayName: "天空之島 · Web 3D 微縮景觀",
    collection: "art3d",
    collectionLabel: "3D 數位藝術",
    description: "浮空島嶼、飛船與蒸氣火車的 Web 3D 立體微縮模型與大氣光影系統，已部署於 GitHub Pages。",
    employeeId: "emp-spencer",
    status: "Live",
    language: "JavaScript",
    repoUrl: "https://github.com/spencer384/sky-island-diorama",
    liveUrl: "https://spencer384.github.io/sky-island-diorama/",
    updatedAt: "2026-11-24T14:11:50Z",
    tags: ["3D Diorama", "Audio", "GitHub Pages"]
  },
  {
    id: "proj-sky-island-godot",
    name: "sky-island-godot",
    displayName: "天空之島 · Godot 遊戲專案",
    collection: "game",
    collectionLabel: "遊戲與地圖",
    description: "使用 Godot 引擎開發的天空之島 3D 探索遊戲，包含 CK124 列車、村莊與地形系統。",
    employeeId: "emp-spencer",
    status: "Active",
    language: "GDScript",
    repoUrl: "https://github.com/spencer384/sky-island-godot",
    liveUrl: "",
    updatedAt: "2026-11-24T14:50:12Z",
    tags: ["Godot", "3D Game", "GDScript"]
  },
  {
    id: "proj-warcraft3-maps",
    name: "warcraft3-maps",
    displayName: "魔獸爭霸 3 自訂對戰地圖與 AI",
    collection: "game",
    collectionLabel: "遊戲與地圖",
    description: "魔獸爭霸3 (Warcraft III) 自訂對戰地圖與進階對戰 AI 調整專區。",
    employeeId: "emp-spencer",
    status: "Active",
    language: "JASS",
    repoUrl: "https://github.com/spencer384/warcraft3-maps",
    liveUrl: "",
    updatedAt: "2026-11-14T08:05:21Z",
    tags: ["Warcraft III", "JASS", "AI"]
  },
  {
    id: "proj-linux-mint-switcher",
    name: "linux-mint-style-switcher-",
    displayName: "Linux Mint 風格切換工具",
    collection: "tools",
    collectionLabel: "工具與系統",
    description: "一鍵切換 Linux Mint 桌面主題、外觀與系統配置的 Shell 工具腳本。",
    employeeId: "emp-spencer",
    status: "Active",
    language: "Shell",
    repoUrl: "https://github.com/spencer384/linux-mint-style-switcher-",
    liveUrl: "",
    updatedAt: "2026-11-18T03:14:55Z",
    tags: ["Linux", "Shell", "Desktop"]
  },
  {
    id: "proj-desktop-tutorial",
    name: "desktop-tutorial",
    displayName: "GitHub Desktop 教學範例庫",
    collection: "tools",
    collectionLabel: "工具與系統",
    description: "GitHub Desktop 私人教學與版控測試儲存庫 (Private Repository)。",
    employeeId: "emp-spencer",
    status: "Private",
    language: "Markdown",
    repoUrl: "https://github.com/spencer384/desktop-tutorial",
    liveUrl: "",
    updatedAt: "2023-05-05T13:26:32Z",
    tags: ["Private", "Tutorial"]
  }
];
