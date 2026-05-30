// ui.js
import { state, getAssetLogo, getUSDPrice } from './state.js';
import { toggleWalletConnection, showToast } from './wallet.js';

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function refreshAssetsUI() {
  const grid = document.getElementById("tickers-grid");
  if (!grid) return;
  grid.innerHTML = "";

  let filteredKeys = Object.keys(state.assets).filter(key => {
    const asset = state.assets[key];
    
    if (state.activeTab === 'crypto' && asset.type !== 'crypto') return false;
    if (state.activeTab === 'stock' && asset.type !== 'stock') return false;
    if (state.activeTab === 'forex') return false; 

    if (state.searchQuery.length > 0) {
      const matchSym = key.toLowerCase().includes(state.searchQuery);
      const matchName = asset.name.toLowerCase().includes(state.searchQuery);
      return matchSym || matchName;
    }
    return true;
  });

  if (filteredKeys.length === 0 && state.activeTab !== 'forex') {
    grid.innerHTML = `
      <div class="col-span-full py-10 flex flex-col items-center justify-center border border-dashed border-slate-205 dark:border-gray-800 rounded-xl bg-slate-50 dark:bg-gray-950/20">
        <i data-lucide="help-circle" class="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2"></i>
        <span class="text-sm font-semibold text-slate-550 dark:text-slate-400">Không tìm thấy tài sản</span>
        <span class="text-[11px] text-slate-400 dark:text-slate-505 mt-1">Vui lòng thử lại với từ khóa khác.</span>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  if (state.activeTab === 'forex') {
    grid.classList.add("hidden");
    return;
  } else {
    grid.classList.remove("hidden");
  }

  filteredKeys.forEach(key => {
    const asset = state.assets[key];
    const isUp = asset.change24h >= 0;
    const isActive = state.activeAsset === key;

    const card = document.createElement("div");
    card.className = `group rounded-2xl border p-5 flex flex-col justify-between h-40 bg-white/60 dark:bg-[#121824]/60 backdrop-blur-md hover:bg-slate-50 dark:hover:bg-[#151c2c] transition-all duration-300 cursor-pointer ${
      isActive 
        ? 'border-emerald-500 dark:border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
        : 'border-slate-200 dark:border-gray-800/80 hover:border-slate-300 dark:hover:border-gray-700/80'
    }`;
    card.onclick = () => selectActiveAsset(key);

    card.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-slate-100 dark:bg-[#090D16] border border-slate-200 dark:border-gray-800/80 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            <img src="${asset.logo}" alt="${asset.name}" class="h-6 w-6 object-contain" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">${asset.name}</h4>
            <span class="text-[11px] text-slate-400 dark:text-slate-500 font-mono font-medium tracking-wider">${asset.ticker}</span>
          </div>
        </div>
        <div class="flex flex-col items-end">
          <span id="price-val-${key}" class="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">
            ${formatCurrency(asset.price)}
          </span>
          <span id="change-val-${key}" class="text-[11px] font-bold mt-0.5 px-1.5 py-0.5 rounded-md ${isUp ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}">
            ${isUp ? '+' : ''}${asset.change24h.toFixed(2)}%
          </span>
        </div>
      </div>
      <div class="h-12 w-full mt-4" id="price-val-container-${key}">
        <canvas id="sparkline-${key}"></canvas>
      </div>
    `;
    grid.appendChild(card);
    setTimeout(() => buildSparkline(key), 0);
  });

  lucide.createIcons();
}

export function selectActiveAsset(key) {
  state.activeAsset = key;
  refreshAssetsUI();

  const active = state.assets[key];
  const chartAssetName = document.getElementById("chart-asset-name");
  const chartAssetSymbol = document.getElementById("chart-asset-symbol");
  const chartAssetPrice = document.getElementById("chart-asset-price");
  const chartAssetChange = document.getElementById("chart-asset-change");
  const chartAssetLogo = document.getElementById("chart-asset-logo");

  if (chartAssetName) chartAssetName.textContent = active.name;
  if (chartAssetSymbol) chartAssetSymbol.textContent = active.ticker;
  if (chartAssetPrice) chartAssetPrice.textContent = formatCurrency(active.price);
  if (chartAssetLogo) {
    chartAssetLogo.src = active.logo;
    chartAssetLogo.alt = active.name;
  }
  
  if (chartAssetChange) {
    const isUp = active.change24h >= 0;
    chartAssetChange.textContent = `${isUp ? '+' : ''}${active.change24h.toFixed(2)}%`;
    chartAssetChange.className = `text-xs font-bold px-2 py-1 rounded-md ${isUp ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`;
  }

  refreshMainChart();
}

export function buildSparkline(key) {
  const canvas = document.getElementById(`sparkline-${key}`);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  if (state.assets[key].sparklineChartInstance) {
    state.assets[key].sparklineChartInstance.destroy();
  }

  const asset = state.assets[key];
  const isUp = asset.change24h >= 0;
  const color = isUp ? '#10B981' : '#EF4444';

  state.assets[key].sparklineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(asset.sparklineData.length).fill(''),
      datasets: [{
        data: asset.sparklineData,
        borderColor: color,
        borderWidth: 1.5,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, `${color}30`);
          gradient.addColorStop(1, `${color}00`);
          return gradient;
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false, min: Math.min(...asset.sparklineData) * 0.995, max: Math.max(...asset.sparklineData) * 1.005 }
      },
      animation: { duration: 0 }
    }
  });
}

export function refreshMainChart() {
  const canvas = document.getElementById("main-trend-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (state.mainChartInstance) {
    state.mainChartInstance.destroy();
  }

  const asset = state.assets[state.activeAsset];
  let dataArr = [];
  let labelFormat = '';

  if (state.activeInterval === '24H') {
    dataArr = asset.history24h;
    labelFormat = 'Hour ';
  } else if (state.activeInterval === '7D') {
    dataArr = asset.history7d;
    labelFormat = 'H ';
  } else {
    dataArr = asset.history30d;
    labelFormat = 'Day ';
  }

  const isUp = asset.change24h >= 0;
  const color = isUp ? '#10B981' : '#EF4444';
  const isDark = document.documentElement.classList.contains('dark');
  
  const tickColor = isDark ? '#64748B' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)';

  state.mainChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dataArr.map((_, i) => `${labelFormat}${i + 1}`),
      datasets: [{
        label: `${asset.ticker} Price`,
        data: dataArr,
        borderColor: color,
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: color,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, `${color}20`);
          gradient.addColorStop(1, `${color}00`);
          return gradient;
        }
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#121824' : '#FFFFFF',
          titleColor: isDark ? '#F8FAFC' : '#0F172A',
          bodyColor: isDark ? '#94A3B8' : '#475569',
          borderColor: isDark ? '#1E293B' : '#E2E8F0',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return formatCurrency(context.parsed.y);
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { maxTicksLimit: 6, color: tickColor, font: { size: 10, family: 'Inter' } }
        },
        y: {
          position: 'right',
          grid: { color: gridColor, drawBorder: false },
          ticks: {
            color: tickColor,
            font: { size: 10, family: 'Inter', family: 'mono' },
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
}

export function setChartInterval(interval) {
  state.activeInterval = interval;
  ['24H', '7D', '30D'].forEach(i => {
    const btn = document.getElementById(`interval-${i}`);
    if (!btn) return;
    if (i === interval) {
      btn.className = "px-2.5 py-1 rounded-md bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-transparent shadow transition-all duration-200";
    } else {
      btn.className = "px-2.5 py-1 rounded-md hover:text-slate-900 dark:hover:text-slate-100 transition-colors";
    }
  });
  refreshMainChart();
}

window.setChartInterval = setChartInterval;
window.selectActiveAsset = selectActiveAsset;

export function updateMoversWidget() {
  let topKey = 'BTC';
  let topVal = -999;
  Object.keys(state.assets).forEach(key => {
    if (state.assets[key].change24h > topVal) {
      topVal = state.assets[key].change24h;
      topKey = key;
    }
  });

  const moverEl = document.getElementById("top-mover");
  if (moverEl) {
    moverEl.textContent = `${topKey} (${topVal >= 0 ? '+' : ''}${topVal.toFixed(2)}%)`;
    moverEl.className = `text-xs font-mono font-bold px-2 py-1 rounded-md ${topVal >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`;
  }
}

export function populateForexTable() {
  const body = document.getElementById("forex-table-body");
  if (!body) return;

  const pairs = [
    { base: 'USD', quote: 'EUR', rate: state.forexRates.EUR, inv: 1 / state.forexRates.EUR },
    { base: 'USD', quote: 'JPY', rate: state.forexRates.JPY, inv: 1 / state.forexRates.JPY },
    { base: 'USD', quote: 'VND', rate: state.forexRates.VND, inv: 1 / state.forexRates.VND },
    { base: 'EUR', quote: 'JPY', rate: state.forexRates.JPY / state.forexRates.EUR, inv: state.forexRates.EUR / state.forexRates.JPY },
    { base: 'EUR', quote: 'VND', rate: state.forexRates.VND / state.forexRates.EUR, inv: state.forexRates.EUR / state.forexRates.VND }
  ];

  const currencyNames = { USD: 'US Dollar', EUR: 'Euro', JPY: 'Yen Nhật', VND: 'Việt Nam Đồng', BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana' };

  body.innerHTML = "";
  pairs.forEach(p => {
    const formattedRate = p.rate >= 1000 ? Math.round(p.rate).toLocaleString('vi-VN') : p.rate.toFixed(4);
    const formattedInv = p.inv >= 0.01 ? p.inv.toFixed(6) : p.inv.toExponential(4);

    const row = document.createElement("tr");
    row.className = "border-b border-slate-100 dark:border-gray-800/40 hover:bg-slate-50/50 dark:hover:bg-gray-800/20 transition-colors";
    row.innerHTML = `
      <td class="py-4 px-4">
        <div class="flex items-center gap-3">
          <div class="flex items-center -space-x-2">
            <img src="${getAssetLogo(p.base)}" alt="${p.base}" class="w-7 h-7 rounded-full object-cover border-2 border-white dark:border-[#121824] shadow-sm" />
            <img src="${getAssetLogo(p.quote)}" alt="${p.quote}" class="w-7 h-7 rounded-full object-cover border-2 border-white dark:border-[#121824] shadow-sm" />
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-slate-900 dark:text-slate-100 text-xs tracking-wide">${p.base} / ${p.quote}</span>
            <span class="text-[10px] text-slate-400 dark:text-slate-500 font-sans">${currencyNames[p.base] || p.base} → ${currencyNames[p.quote] || p.quote}</span>
          </div>
        </div>
      </td>
      <td class="py-4 px-4">
        <span class="font-bold text-slate-900 dark:text-slate-100 font-mono text-sm">${formattedRate}</span>
        <span class="text-[10px] text-slate-400 dark:text-slate-500 font-sans ml-1">${p.quote}</span>
      </td>
      <td class="py-4 px-4">
        <span class="font-mono text-slate-500 dark:text-slate-400 text-xs">${formattedInv}</span>
        <span class="text-[10px] text-slate-400 dark:text-slate-500 font-sans ml-1">${p.base}</span>
      </td>
      <td class="py-4 px-4">
        <span class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full text-[10px] font-sans">
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
          Đang hoạt động
        </span>
      </td>
    `;
    body.appendChild(row);
  });
}

export function flashCardTick(key, isUp) {
  const container = document.getElementById(`price-val-container-${key}`);
  if (container) {
    container.classList.remove("tick-up", "tick-down");
    void container.offsetWidth; 
    container.classList.add(isUp ? "tick-up" : "tick-down");
  }
}

export function refreshLivePricesInDOM() {
  Object.keys(state.assets).forEach(key => {
    const asset = state.assets[key];
    const valEl = document.getElementById(`price-val-${key}`);
    const changeEl = document.getElementById(`change-val-${key}`);

    if (valEl) valEl.textContent = formatCurrency(asset.price);
    if (changeEl) {
      const isUp = asset.change24h >= 0;
      changeEl.textContent = `${isUp ? '+' : ''}${asset.change24h.toFixed(2)}%`;
      changeEl.className = `text-[11px] font-bold px-1.5 py-0.5 rounded-md ${isUp ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`;
    }
  });

  const active = state.assets[state.activeAsset];
  const mainPrice = document.getElementById("chart-asset-price");
  const mainChange = document.getElementById("chart-asset-change");

  if (mainPrice) mainPrice.textContent = formatCurrency(active.price);
  if (mainChange) {
    const isUp = active.change24h >= 0;
    mainChange.textContent = `${isUp ? '+' : ''}${active.change24h.toFixed(2)}%`;
    mainChange.className = `text-xs font-bold px-2 py-1 rounded-md ${isUp ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`;
  }

  if (state.mainChartInstance && active) {
    const dataset = state.mainChartInstance.data.datasets[0];
    if (dataset && dataset.data.length > 0) {
      dataset.data[dataset.data.length - 1] = active.price;
      state.mainChartInstance.update('none');
    }
  }
}

// Uniswap-style Swap UI logic
export function calculateConversion() {
  const amountInput = document.getElementById("conv-amount");
  const fromSelect = document.getElementById("conv-from");
  const toSelect = document.getElementById("conv-to");
  const resultInput = document.getElementById("conv-result");

  const fromUsdValEl = document.getElementById("conv-from-usd-val");
  const toUsdValEl = document.getElementById("conv-to-usd-val");
  const swapRateLabel = document.getElementById("swap-rate-label");

  if (!amountInput || !fromSelect || !toSelect || !resultInput) return;

  const amountVal = parseFloat(amountInput.value);
  const fromVal = fromSelect.value;
  const toVal = toSelect.value;

  if (isNaN(amountVal) || amountVal <= 0) {
    resultInput.value = "0.00";
    if (fromUsdValEl) fromUsdValEl.textContent = "~$0.00";
    if (toUsdValEl) toUsdValEl.textContent = "~$0.00";
    if (swapRateLabel) swapRateLabel.textContent = `1 ${fromVal} ≈ 0 ${toVal}`;
    return;
  }

  const priceFrom = getUSDPrice(fromVal);
  const priceTo = getUSDPrice(toVal);

  if (priceFrom === 0 || priceTo === 0) return;

  const totalUSDValue = amountVal * priceFrom;
  const destValue = totalUSDValue / priceTo;

  if (toVal === 'VND') {
    resultInput.value = Math.round(destValue).toLocaleString('en-US');
  } else if (toVal === 'JPY') {
    resultInput.value = destValue.toFixed(2);
  } else if (destValue >= 1000) {
    resultInput.value = destValue.toLocaleString('en-US', { maximumFractionDigits: 2 });
  } else if (destValue >= 1) {
    resultInput.value = destValue.toFixed(4);
  } else {
    resultInput.value = destValue.toFixed(6);
  }

  if (fromUsdValEl) {
    fromUsdValEl.textContent = `~$${totalUSDValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (toUsdValEl) {
    toUsdValEl.textContent = `~$${totalUSDValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  if (swapRateLabel) {
    const relativeRate = priceFrom / priceTo;
    let formattedRate = "";
    if (relativeRate >= 1000) {
      formattedRate = relativeRate.toLocaleString('en-US', { maximumFractionDigits: 2 });
    } else if (relativeRate >= 0.0001) {
      formattedRate = relativeRate.toFixed(4);
    } else {
      formattedRate = relativeRate.toFixed(8);
    }
    swapRateLabel.textContent = `1 ${fromVal} = ${formattedRate} ${toVal}`;
  }
}

export function updateSwapIcons() {
  const fromVal = document.getElementById("conv-from").value;
  const toVal = document.getElementById("conv-to").value;
  
  const fromLogo = document.getElementById("swap-from-logo");
  const toLogo = document.getElementById("swap-to-logo");
  
  if (fromLogo) fromLogo.src = getAssetLogo(fromVal);
  if (toLogo) toLogo.src = getAssetLogo(toVal);
}

export function openTokenSelector(side) {
  const tokens = [
    { id: 'BTC', name: 'Bitcoin' },
    { id: 'ETH', name: 'Ethereum' },
    { id: 'SOL', name: 'Solana' },
    { id: 'USD', name: 'US Dollar' },
    { id: 'EUR', name: 'Euro' },
    { id: 'JPY', name: 'Japanese Yen' },
    { id: 'VND', name: 'Vietnamese Dong' }
  ];

  let listHtml = tokens.map(t => {
    const logo = getAssetLogo(t.id);
    return `
      <div onclick="selectToken('${side}', '${t.id}')" class="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-gray-800/50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-gray-700">
        <div class="flex items-center gap-3">
          <img src="${logo}" class="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-gray-700 shadow-sm bg-white" />
          <div class="flex flex-col">
            <span class="font-bold text-slate-900 dark:text-slate-100 leading-tight">${t.id}</span>
            <span class="text-xs text-slate-500 dark:text-slate-400">${t.name}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const modalHtml = `
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">Chọn Token</h3>
      <button onclick="hideModal()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-gray-800">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
    </div>
    <div class="max-h-[60vh] overflow-y-auto space-y-1 custom-scrollbar">
      ${listHtml}
    </div>
  `;
  showModal(modalHtml);
}

export function selectToken(side, token) {
  document.getElementById(`conv-${side}`).value = token;
  document.getElementById(`swap-${side}-text`).textContent = token;
  updateSwapIcons();
  calculateConversion();
  hideModal();
}

export function swapConverterCurrencies() {
  const fromEl = document.getElementById("conv-from");
  const toEl = document.getElementById("conv-to");
  if (!fromEl || !toEl) return;
  const tempVal = fromEl.value;

  fromEl.value = toEl.value;
  toEl.value = tempVal;

  document.getElementById("swap-from-text").textContent = fromEl.value;
  document.getElementById("swap-to-text").textContent = toEl.value;

  calculateConversion();
  updateSwapIcons();
}

export function showModal(htmlContent) {
  const overlay = document.getElementById("modal-overlay");
  const content = document.getElementById("modal-content");
  if (!overlay || !content) return;
  
  content.innerHTML = htmlContent;
  overlay.classList.remove("opacity-0", "pointer-events-none");
  overlay.classList.add("opacity-100", "pointer-events-auto");
  content.classList.remove("scale-95");
  content.classList.add("scale-100");
  lucide.createIcons();
}

export function hideModal() {
  const overlay = document.getElementById("modal-overlay");
  const content = document.getElementById("modal-content");
  if (!overlay || !content) return;

  overlay.classList.remove("opacity-100", "pointer-events-auto");
  overlay.classList.add("opacity-0", "pointer-events-none");
  content.classList.remove("scale-100");
  content.classList.add("scale-95");
}

window.hideModal = hideModal;

export function executeSwapTransaction() {
  if (!state.walletConnected) {
    toggleWalletConnection();
    return;
  }
  
  const btn = document.getElementById("swap-action-btn");
  if (!btn) return;
  
  // Prevent double clicking
  if (btn.disabled) return;

  // Processing UI state
  btn.disabled = true;
  const originalHtml = btn.innerHTML;
  btn.innerHTML = `
    <i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i>
    <span>Đang xác nhận...</span>
  `;
  lucide.createIcons();
  btn.classList.add("opacity-80", "cursor-not-allowed");

  const fromVal = document.getElementById("conv-from").value;
  const toVal = document.getElementById("conv-to").value;
  const amountVal = document.getElementById("conv-amount").value;
  const resultVal = document.getElementById("conv-result").value;

  // Simulate network delay for processing effect
  setTimeout(() => {
    // Restore button state
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    btn.classList.remove("opacity-80", "cursor-not-allowed");
    lucide.createIcons();

    // Show success popup modal
    const modalHtml = `
      <div class="flex flex-col items-center text-center">
        <div class="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
          <i data-lucide="check-circle-2" class="w-7 h-7"></i>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">Hoán đổi Thành công!</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Bạn đã hoán đổi thành công <br/>
          <span class="font-bold text-slate-800 dark:text-slate-200">${amountVal} ${fromVal}</span> lấy <span class="font-bold text-slate-800 dark:text-slate-200">${resultVal} ${toVal}</span>.
        </p>
        <button onclick="hideModal()" class="w-full bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-slate-900 dark:text-slate-100 font-semibold py-2.5 rounded-xl transition-colors cursor-pointer">
          Đóng
        </button>
      </div>
    `;
    showModal(modalHtml);
  }, 2000);
}

export function updateSwapButtonState() {
  const btn = document.getElementById("swap-action-btn");
  if (!btn) return;

  if (state.walletConnected) {
    btn.innerHTML = `<span>Xác nhận Hoán đổi</span>`;
    btn.className = "w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer flex items-center justify-center gap-2";
  } else {
    btn.innerHTML = `<span>Kết nối Ví để Hoán đổi</span>`;
    btn.className = "w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30 py-4 rounded-2xl font-bold text-sm transition-all duration-300 shadow-sm cursor-pointer flex items-center justify-center gap-2";
  }
}

window.calculateConversion = calculateConversion;
window.updateSwapIcons = updateSwapIcons;
window.swapConverterCurrencies = swapConverterCurrencies;
window.executeSwapTransaction = executeSwapTransaction;
window.openTokenSelector = openTokenSelector;
window.selectToken = selectToken;
