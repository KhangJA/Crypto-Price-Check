# Crypto Price Checker

Một bảng điều khiển tài chính đơn giản nhưng chuyên nghiệp mang phong cách Web3 (phi tập trung), giúp bạn theo dõi giá cả theo thời gian thực.

## 🚀 Các Tính năng chính

- **Dữ liệu Crypto Trực tiếp**: Lấy giá thực tế từ Binance (BTC, ETH, SOL).
- **Giao diện Hoán đổi (Swap)**: Trải nghiệm tính năng quy đổi tiền tệ giống hệt Uniswap.
- **Mô phỏng Chứng khoán**: Mô phỏng dữ liệu giá chứng khoán (AAPL, TSLA, NVDA) biến động như thật.
- **Biểu đồ Trực quan**: Biểu đồ hiển thị giá với phong cách hiện đại.
- **Chế độ Tối / Sáng**: Hỗ trợ giao diện nền đen và nền trắng.
- **Kết nối Ví Demo**: Mô phỏng quá trình kết nối ví Web3.

## 🛠️ Công nghệ Sử dụng

- **Giao diện**: HTML, JavaScript (ES6 Modules).
- **CSS**: Tailwind CSS.
- **Biểu đồ**: Chart.js.
- **Icon**: Lucide Icons, UI-Avatars, CryptoLogos.

## 🎮 Hướng dẫn Sử dụng

Để chạy dự án này trên máy tính của bạn, bạn cần một Local Server (Máy chủ cục bộ) do dự án sử dụng ES6 Modules.

**Cách 1: Dùng VS Code**
1. Cài đặt tiện ích **Live Server**.
2. Chuột phải vào file `index.html` và chọn **Open with Live Server**.

**Cách 2: Dùng Node.js (npx)**
Mở Terminal tại thư mục dự án và chạy lệnh:
```bash
npx serve .
```
Sau đó truy cập `http://localhost:3000` trên trình duyệt.

**Cách 3: Dùng Python**
Mở Terminal tại thư mục dự án và chạy lệnh:
```bash
python -m http.server 8000
```
Sau đó truy cập `http://localhost:8000` trên trình duyệt.

---
**Trải nghiệm tính năng Hoán đổi (Swap):**
1. Nhấn nút **"Kết nối Ví"** ở góc trên cùng bên phải.
2. Tại bảng **Hoán đổi Tài sản**, chọn loại tiền bạn có (VD: BTC) và loại tiền muốn nhận (VD: VND).
3. Nhập số lượng và nhấn **"Xác nhận Hoán đổi"** để xem hiệu ứng xử lý Web3 tuyệt đẹp!
