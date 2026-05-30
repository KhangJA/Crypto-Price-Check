# Crypto Price Checker

Chào mọi người! Đây là một dự án nhỏ mà mình làm một cái demo dashboard giá của các đổng coin và cổ phiếu. Giao diện được thiết kế theo phong cách Web3 (phi tập trung) hiện đại và dễ tiếp cận.

## Link Demo: https://khangja.github.io/Crypto-Price-Check/
---

## Dự án này có gì?

- **Giá Crypto Real-time:** Dữ liệu giá của các đồng coin lớn (BTC, ETH, SOL) được lấy trực tiếp từ API của Binance.
- **Tính năng Giả lập Swap:** Mình có thiết kế một bộ khung hoán đổi tài sản nhìn y hệt như Uniswap. Bạn có thể nhập số lượng và bấm đổi thử để xem hiệu ứng xử lý Web3 cực mượt.
- **Bảng Giá Chứng Khoán (Mô phỏng):** Ngoài crypto, mình có làm thêm phần giả lập biến động giá cho mấy mã công nghệ lớn như AAPL, TSLA, NVDA.
- **Biểu đồ Trực quan:** Sử dụng biểu đồ để theo dõi xu hướng giá, giao diện hiện đại và rất nịnh mắt.
- **Dark/Light Mode:** Giao diện tối huyền bí hay sáng sủa sạch sẽ đều có đủ.
- **Demo Kết nối Ví:** Trải nghiệm thử cảm giác bấm "Connect Wallet" chuẩn chỉnh Web3.

---

## Công nghệ sử dụng

Để giữ cho project dễ chạy, mình chủ yếu dùng các công nghệ thuần:
- **Frontend:** HTML, JavaScript thuần.
- **Styling:** Tailwind CSS (giúp tạo giao diện nhanh và responsive tốt).
- **Chart:** Chart.js (thư viện vẽ biểu đồ cực kỳ gọn nhẹ).
- **Icons & Avatar:** Sử dụng kết hợp Lucide Icons, UI-Avatars và CryptoLogos để hiển thị.

---

## Cách chạy thử trên máy của bạn

### Cách 1: Dùng VS Code 
1. Bạn vào mục Extensions trên VS Code, tìm và cài tiện ích tên là Live Server.
2. Click chuột phải vào file index.html của dự án rồi chọn Open with Live Server.

### Cách 2: Dùng Node.js
Mở Terminal ngay tại thư mục dự án và gõ lệnh:
```bash
npx serve .
```
Sau đó mở trình duyệt và truy cập vào địa chỉ: http://localhost:3000

### Cách 3: Dùng Python
Nếu máy bạn có cài Python, mở Terminal tại thư mục dự án và chạy:
```bash
python -m http.server 8000
```
Sau đó mở trình duyệt và truy cập vào địa chỉ: http://localhost:8000

---

## Thử nghiệm tính năng Swap (Hoán đổi) như thế nào?

1. Nhìn lên góc trên cùng bên phải, bấm nút "Kết nối Ví" (ví demo thử nghiệm tính năng).
2. Ở khung Hoán đổi Tài sản, bạn chọn đồng tiền mình đang có (ví dụ: BTC) và đồng tiền muốn đổi sang (ví dụ: VND).
3. Nhập số lượng coin bất kỳ rồi bấm "Xác nhận Hoán đổi" để tận hưởng hiệu ứng xử lý cực kỳ đẹp mắt nhé!
