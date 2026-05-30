// api.js
import { state } from './state.js';
import { updateMoversWidget, populateForexTable, flashCardTick, refreshLivePricesInDOM, calculateConversion, updateSwapIcons } from './ui.js';

export async function synchronizeForexRates() {
  const infoEl = document.getElementById("forex-info");
  try {
    const respF = await fetch("https://api.frankfurter.app/latest?from=USD&to=EUR,JPY");
    if (!respF.ok) throw new Error("Frankfurter request failed");
    
    const dataF = await respF.json();
    state.forexRates.EUR = dataF.rates.EUR;
    state.forexRates.JPY = dataF.rates.JPY;

    const respV = await fetch("https://open.er-api.com/v6/latest/USD");
    if (respV.ok) {
      const dataV = await respV.json();
      if (dataV.rates && dataV.rates.VND) {
        state.forexRates.VND = dataV.rates.VND;
      }
    }

    if (infoEl) infoEl.textContent = `Rates: 1 USD = ${state.forexRates.EUR.toFixed(4)} EUR | ${state.forexRates.JPY.toFixed(2)} JPY | ${Math.round(state.forexRates.VND).toLocaleString()} VND`;
    populateForexTable();
  } catch (err) {
    console.warn("Forex nodes down, utilizing terminal defaults:", err);
    if (infoEl) infoEl.innerHTML = `<span class="text-amber-500 font-semibold">Forex rate limits hit. Defaulting to terminal baselines.</span>`;
    populateForexTable();
  }
  calculateConversion();
  updateSwapIcons();
}

export async function synchronizeCryptoFeeds() {
  const alertEl = document.getElementById("api-alert");
  try {
    const resp = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbols=[%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22]');
    if (!resp.ok) throw new Error("Binance prices failed");
    
    const data = await resp.json();
    data.forEach(item => {
      const key = item.symbol.replace("USDT", "");
      if (state.assets[key]) {
        state.assets[key].price = parseFloat(item.lastPrice);
        state.assets[key].change24h = parseFloat(item.priceChangePercent);
      }
    });

    if (alertEl) alertEl.classList.remove("hidden");

    await Promise.all([
      syncAssetKlines('BTC', 'BTCUSDT'),
      syncAssetKlines('ETH', 'ETHUSDT'),
      syncAssetKlines('SOL', 'SOLUSDT')
    ]);
  } catch (err) {
    console.warn("Binance gateway blocked or rate limited, keeping mock fallbacks:", err);
    state.assets.BTC.price = state.assets.BTC.price || 73584.27;
    state.assets.ETH.price = state.assets.ETH.price || 2017.10;
    state.assets.SOL.price = state.assets.SOL.price || 82.34;
    populateDefaultHistories();
  }
}

async function syncAssetKlines(key, symbol) {
  const asset = state.assets[key];
  try {
    const resp24 = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`);
    if (resp24.ok) {
      const data = await resp24.json();
      asset.history24h = data.map(kline => parseFloat(kline[4]));
    }
    
    const resp7 = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=4h&limit=42`);
    if (resp7.ok) {
      const data = await resp7.json();
      asset.history7d = data.map(kline => parseFloat(kline[4]));
      asset.sparklineData = [...asset.history7d];
    }

    const resp30 = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=30`);
    if (resp30.ok) {
      const data = await resp30.json();
      asset.history30d = data.map(kline => parseFloat(kline[4]));
    }
  } catch (err) {
    console.warn(`Could not load klines for ${symbol}, utilizing mock fallback.`);
  }
}

export function initPriceTickEngine() {
  setInterval(async () => {
    try {
      const resp = await fetch('https://api.binance.com/api/v3/ticker/price?symbols=[%22BTCUSDT%22,%22ETHUSDT%22,%22SOLUSDT%22]');
      if (resp.ok) {
        const data = await resp.json();
        data.forEach(item => {
          const key = item.symbol.replace("USDT", "");
          const prev = state.assets[key].price;
          const next = parseFloat(item.price);
          state.assets[key].price = next;
          flashCardTick(key, next >= prev);
        });
      } else {
        tickSimulatedCrypto();
      }
    } catch (e) {
      tickSimulatedCrypto();
    }

    Object.keys(state.assets).forEach(key => {
      const asset = state.assets[key];
      if (asset.type === 'stock') {
        const prev = asset.price;
        const variance = (Math.random() - 0.5) * 0.002;
        asset.price = asset.price * (1 + variance);
        asset.change24h += variance * 100;
        flashCardTick(key, asset.price >= prev);
      }
    });

    refreshLivePricesInDOM();
    updateMoversWidget();
    calculateConversion();
  }, 5000);
}

function tickSimulatedCrypto() {
  ['BTC', 'ETH', 'SOL'].forEach(key => {
    const asset = state.assets[key];
    const prev = asset.price;
    const variance = (Math.random() - 0.5) * 0.001; 
    asset.price = asset.price * (1 + variance);
    asset.change24h += variance * 100;
    flashCardTick(key, asset.price >= prev);
  });
}

function constructHistoryWalk(targetPrice, count, variance, directionPercentage = 0) {
  let data = [];
  let currentVal = targetPrice / (1 + (directionPercentage / 100));
  
  for (let i = 0; i < count; i++) {
    const noise = (Math.random() - 0.5) * variance;
    const drift = (directionPercentage / 100) / count;
    currentVal = currentVal * (1 + noise + drift);
    data.push(Number(currentVal.toFixed(2)));
  }
  
  data[data.length - 1] = targetPrice;
  return data;
}

export function populateDefaultHistories() {
  Object.keys(state.assets).forEach(key => {
    const asset = state.assets[key];
    const isCrypto = asset.type === 'crypto';
    
    asset.history24h = constructHistoryWalk(asset.price || (isCrypto ? 2500 : 150), 24, 0.012, asset.change24h);
    asset.history7d = constructHistoryWalk(asset.price || (isCrypto ? 2500 : 150), 42, 0.025, asset.change24h);
    asset.history30d = constructHistoryWalk(asset.price || (isCrypto ? 2500 : 150), 30, 0.065, asset.change24h);
    asset.sparklineData = [...asset.history7d];
  });
}
