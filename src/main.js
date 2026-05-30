// main.js
import { state } from './state.js';
import { synchronizeForexRates, synchronizeCryptoFeeds, initPriceTickEngine, populateDefaultHistories } from './api.js';
import { refreshAssetsUI, refreshMainChart, updateMoversWidget, calculateConversion, updateSwapIcons, updateSwapButtonState } from './ui.js';

document.addEventListener("DOMContentLoaded", () => {
  initTerminal();
});

function initTerminal() {
  const savedTheme = localStorage.getItem("theme");
  const html = document.documentElement;
  const themeIcon = document.getElementById("theme-toggle-icon");
  if (savedTheme === "light") {
    html.classList.remove("dark");
    if (themeIcon) themeIcon.setAttribute("data-lucide", "moon");
  }

  evaluateTradingHours();
  populateDefaultHistories();
  calculateConversion();
  updateSwapIcons();

  synchronizeForexRates();

  synchronizeCryptoFeeds().then(() => {
    selectActiveAsset(state.activeAsset);
    refreshAssetsUI();
    refreshMainChart();
    updateMoversWidget();
    calculateConversion(); 
    updateSwapIcons();
  });

  bindSearchBar();
  bindMobileDrawer();
  initPriceTickEngine();
  updateSwapButtonState();

  lucide.createIcons();
}

function toggleTheme() {
  const html = document.documentElement;
  const themeIcon = document.getElementById("theme-toggle-icon");

  if (html.classList.contains("dark")) {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
    if (themeIcon) themeIcon.setAttribute("data-lucide", "moon");
  } else {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
    if (themeIcon) themeIcon.setAttribute("data-lucide", "sun");
  }

  lucide.createIcons();
  refreshAssetsUI();
  refreshChartThemeColors();
}

function refreshChartThemeColors() {
  if (!state.mainChartInstance) return;
  const isDark = document.documentElement.classList.contains('dark');
  const tickColor = isDark ? '#64748B' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)';
  const yGridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.05)';
  const tooltipBg = isDark ? '#090D16' : '#FFFFFF';
  const tooltipTitleColor = isDark ? '#F8FAFC' : '#0F172A';
  const tooltipBodyColor = isDark ? '#94A3B8' : '#475569';
  const tooltipBorder = isDark ? '#1E293B' : '#E2E8F0';

  state.mainChartInstance.options.scales.x.grid.color = gridColor;
  state.mainChartInstance.options.scales.x.ticks.color = tickColor;
  state.mainChartInstance.options.scales.y.grid.color = yGridColor;
  state.mainChartInstance.options.scales.y.ticks.color = tickColor;
  
  state.mainChartInstance.options.plugins.tooltip.backgroundColor = tooltipBg;
  state.mainChartInstance.options.plugins.tooltip.titleColor = tooltipTitleColor;
  state.mainChartInstance.options.plugins.tooltip.bodyColor = tooltipBodyColor;
  state.mainChartInstance.options.plugins.tooltip.borderColor = tooltipBorder;
  
  state.mainChartInstance.update();
}

function evaluateTradingHours() {
  const now = new Date();
  const day = now.getDay();
  
  const nyseStatusEl = document.getElementById("nyse-status");
  const fxStatusEl = document.getElementById("fx-status");

  if (day === 0 || day === 6) {
    if (nyseStatusEl) {
      nyseStatusEl.innerHTML = `<span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>CLOSED (Weekend)`;
      nyseStatusEl.className = "flex items-center gap-1.5 text-red-500 font-medium text-[11px]";
    }
  } else {
    const estHour = (now.getUTCHours() - 4 + 24) % 24;
    if (nyseStatusEl) {
      if (estHour >= 9 && estHour < 16) {
        nyseStatusEl.innerHTML = `<span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>OPEN`;
        nyseStatusEl.className = "flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 font-bold text-[11px]";
      } else {
        nyseStatusEl.innerHTML = `<span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>CLOSED`;
        nyseStatusEl.className = "flex items-center gap-1.5 text-red-500 font-medium text-[11px]";
      }
    }
  }

  if (fxStatusEl) {
    if (day === 6 || (day === 5 && now.getUTCHours() > 21) || (day === 0 && now.getUTCHours() < 22)) {
      fxStatusEl.innerHTML = `<span class="h-1.5 w-1.5 rounded-full bg-red-500"></span>CLOSED (Weekend)`;
      fxStatusEl.className = "flex items-center gap-1.5 text-red-500 font-medium text-[11px]";
    } else {
      fxStatusEl.innerHTML = `<span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>OPEN`;
      fxStatusEl.className = "flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 font-bold text-[11px]";
    }
  }
}

function bindSearchBar() {
  const input = document.getElementById("search-input");
  const btn = document.getElementById("search-clear-btn");
  if (!input || !btn) return;

  input.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    if (state.searchQuery.length > 0) {
      btn.classList.remove("hidden");
    } else {
      btn.classList.add("hidden");
    }
    refreshAssetsUI();
  });

  btn.addEventListener("click", () => {
    input.value = "";
    state.searchQuery = "";
    btn.classList.add("hidden");
    refreshAssetsUI();
  });
}

function bindMobileDrawer() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("mobile-sidebar-overlay");
  const toggle = document.getElementById("mobile-toggle-btn");
  if (!sidebar || !overlay || !toggle) return;

  function openDrawer() {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
  }

  function closeDrawer() {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
  }

  toggle.addEventListener("click", openDrawer);
  overlay.addEventListener("click", closeDrawer);

  const navBtns = sidebar.querySelectorAll("nav button");
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (window.innerWidth < 768) closeDrawer();
    });
  });
}

function switchTab(tab) {
  state.activeTab = tab;

  const tabs = ['all', 'crypto', 'stock', 'forex', 'wallet'];
  tabs.forEach(t => {
    const btn = document.getElementById(`nav-${t}`);
    if (!btn) return;
    const icon = btn.querySelector("i");
    
    if (t === tab) {
      btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all duration-200 bg-slate-100 dark:bg-gray-800/40 text-slate-900 dark:text-slate-100 border-l-2 border-sky-400";
      if (icon) {
        icon.className = "w-4 h-4";
        icon.style.color = "#38BDF8";
      }
    } else {
      btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all duration-200 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800/30 hover:text-slate-900 dark:hover:text-slate-100 border-l-2 border-transparent";
      if (icon) {
        icon.className = "w-4 h-4";
        icon.style.color = "";
      }
    }
  });

  const title = document.getElementById("page-title");
  const subtitle = document.getElementById("page-subtitle");

  if (title && subtitle) {
    if (tab === 'all') {
      title.textContent = "Tổng quan Thị trường";
      subtitle.textContent = "Giá tài sản thời gian thực, biểu đồ trực tiếp và công cụ chuyển đổi tiền tệ.";
    } else if (tab === 'crypto') {
      title.textContent = "Tiền điện tử";
      subtitle.textContent = "Dữ liệu giá thực tế theo từng giây từ Binance cho các tài sản số.";
    } else if (tab === 'stock') {
      title.textContent = "Thị trường Chứng khoán";
      subtitle.textContent = "Mô phỏng dao động thị trường trực tiếp theo thời gian thực.";
    } else if (tab === 'forex') {
      title.textContent = "Hoán đổi Ngoại hối Toàn cầu";
      subtitle.textContent = "Hoán đổi phi tập trung và chuyển đổi tiền tệ theo thời gian thực.";
    } else if (tab === 'wallet') {
      title.textContent = "Ví của tôi (Web3 Dashboard)";
      subtitle.textContent = "Quản lý số dư danh mục đầu tư phi tập trung thời gian thực và nhận Faucet thử nghiệm.";
    }
  }

  const dView = document.getElementById("dashboard-view-panel");
  const fView = document.getElementById("forex-view-panel");
  const wView = document.getElementById("wallet-view-panel");
  const fDest = document.getElementById("forex-converter-destination");
  const sDest = document.getElementById("sidebar-widgets-container");
  const convWidget = document.getElementById("converter-widget");

  if (tab === 'forex') {
    if (dView) dView.classList.add("hidden");
    if (wView) wView.classList.add("hidden");
    if (fView) fView.classList.remove("hidden");
    if (fDest && convWidget) {
      fDest.appendChild(convWidget);
    }
  } else if (tab === 'wallet') {
    if (dView) dView.classList.add("hidden");
    if (fView) fView.classList.add("hidden");
    if (wView) wView.classList.remove("hidden");
    
    // Tự động render dashboard ví
    if (window.renderWalletDashboard) {
      window.renderWalletDashboard();
    }
  } else {
    if (fView) fView.classList.add("hidden");
    if (wView) wView.classList.add("hidden");
    if (dView) dView.classList.remove("hidden");
    if (sDest && convWidget) {
      sDest.insertBefore(convWidget, sDest.firstChild);
    }
  }

  refreshAssetsUI();
}

window.toggleTheme = toggleTheme;
window.switchTab = switchTab;
