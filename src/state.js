// state.js
export const state = {
  assets: {
    BTC: { 
      name: "Bitcoin", 
      type: "crypto", 
      ticker: "BTCUSDT", 
      logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      price: 0, change24h: 0, history24h: [], history7d: [], history30d: [], sparklineData: [], sparklineChartInstance: null 
    },
    ETH: { 
      name: "Ethereum", 
      type: "crypto", 
      ticker: "ETHUSDT", 
      logo: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
      price: 0, change24h: 0, history24h: [], history7d: [], history30d: [], sparklineData: [], sparklineChartInstance: null 
    },
    SOL: { 
      name: "Solana", 
      type: "crypto", 
      ticker: "SOLUSDT", 
      logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
      price: 0, change24h: 0, history24h: [], history7d: [], history30d: [], sparklineData: [], sparklineChartInstance: null 
    },
    AAPL: { 
      name: "Apple Inc.", 
      type: "stock", 
      ticker: "AAPL", 
      logo: "https://ui-avatars.com/api/?name=AAPL&background=000&color=fff&rounded=true&bold=true",
      price: 190.24, change24h: 1.25, history24h: [], history7d: [], history30d: [], sparklineData: [], sparklineChartInstance: null 
    },
    TSLA: { 
      name: "Tesla Inc.", 
      type: "stock", 
      ticker: "TSLA", 
      logo: "https://ui-avatars.com/api/?name=TSLA&background=e82127&color=fff&rounded=true&bold=true",
      price: 176.19, change24h: -2.48, history24h: [], history7d: [], history30d: [], sparklineData: [], sparklineChartInstance: null 
    },
    NVDA: { 
      name: "NVIDIA Corp.", 
      type: "stock", 
      ticker: "NVDA", 
      logo: "https://ui-avatars.com/api/?name=NVDA&background=76b900&color=fff&rounded=true&bold=true",
      price: 120.45, change24h: 4.82, history24h: [], history7d: [], history30d: [], sparklineData: [], sparklineChartInstance: null 
    }
  },
  forexRates: {
    USD: 1.0,
    EUR: 0.92,
    JPY: 156.4,
    VND: 25450
  },
  activeAsset: 'BTC',
  activeInterval: '7D',
  walletConnected: false,
  walletAddress: '',
  walletBalance: 0,
  searchQuery: '',
  activeTab: 'all',
  mainChartInstance: null
};

export function getUSDPrice(symbol) {
  if (state.assets[symbol]) {
    return state.assets[symbol].price;
  }
  if (symbol === 'USD') return 1.0;
  if (state.forexRates[symbol]) {
    return 1.0 / state.forexRates[symbol];
  }
  return 0.0;
}

export function getAssetLogo(symbol) {
  if (state.assets[symbol]) {
    return state.assets[symbol].logo;
  }
  const fiatLogos = {
    USD: "https://flagcdn.com/w80/us.png",
    EUR: "https://flagcdn.com/w80/eu.png",
    JPY: "https://flagcdn.com/w80/jp.png",
    VND: "https://flagcdn.com/w80/vn.png"
  };
  return fiatLogos[symbol] || "";
}
