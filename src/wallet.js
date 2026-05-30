// wallet.js
import { state } from './state.js';
import { updateSwapButtonState } from './ui.js';

export function toggleWalletConnection() {
  const btnText = document.getElementById("wallet-btn-text");
  const btnDot = document.getElementById("wallet-status-dot");
  const portfolioVal = document.getElementById("portfolio-value");

  if (!state.walletConnected) {
    // Simulate connection delay for realism
    btnText.textContent = "Đang kết nối...";
    btnDot.className = "w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse";
    
    setTimeout(() => {
      state.walletConnected = true;
      // Generate a mock wallet address
      const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase();
      state.walletAddress = `0x71C...${randomHex.padStart(4, '0')}`;
      state.walletBalance = (Math.random() * 50000 + 10000).toFixed(2);
      
      btnText.textContent = state.walletAddress;
      btnDot.className = "w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
      
      if (portfolioVal) {
        portfolioVal.textContent = `$${parseFloat(state.walletBalance).toLocaleString('en-US')}`;
      }
      
      updateSwapButtonState();
      showToast("Đã kết nối Ví", "Thành công kết nối với nhà cung cấp Web3.");
    }, 800);
  } else {
    state.walletConnected = false;
    state.walletAddress = "";
    state.walletBalance = 0;
    
    btnText.textContent = "Kết nối Ví";
    btnDot.className = "w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500";
    
    if (portfolioVal) {
      portfolioVal.textContent = `$0.00`;
    }
    
    updateSwapButtonState();
    showToast("Đã ngắt kết nối Ví", "Phiên làm việc Web3 của bạn đã kết thúc.");
  }
}

export function showToast(title, desc) {
  const toast = document.getElementById("toast");
  const tTitle = document.getElementById("toast-title");
  const tDesc = document.getElementById("toast-desc");
  if (!toast || !tTitle || !tDesc) return;

  tTitle.textContent = title;
  tDesc.textContent = desc;
  
  toast.classList.remove("translate-y-24", "opacity-0");
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    hideToast();
  }, 3000);
}

export function hideToast() {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.classList.add("translate-y-24", "opacity-0");
  }
}

// Make functions globally accessible for inline HTML handlers if needed
window.toggleWalletConnection = toggleWalletConnection;
window.hideToast = hideToast;
