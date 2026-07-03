# 🛍️ Rya's Store - E-Commerce API (Backend)

Đây là Backend API cho dự án E-Commerce thời trang , được thiết kế theo kiến trúc RESTful phục vụ cho Web App (Vue 3).

## 🚀 Công nghệ sử dụng
- **Framework:** Node.js + Express.js
- **Ngôn ngữ:** TypeScript
- **Database ORM:** Prisma
- **Hệ quản trị CSDL:** MySQL
- **Xác thực:** JWT (Access Token & Refresh Token)
- **Lưu trữ ảnh:** Multer (Local disk)

## 📌 Các Module chính
1. **Auth & User:** Đăng ký, đăng nhập, quên mật khẩu (Gửi email + mã OTP thực qua Nodemailer), Quản lý hồ sơ, Sổ địa chỉ.
2. **Product Catalog:** Quản lý Danh mục (Categories), Thuộc tính (Attributes - Size, Màu), Sản phẩm & Biến thể (Variants).
3. **Cart & Order:** Giỏ hàng, Đặt hàng Checkout, Quản lý đơn hàng. Đặc biệt có xử lý **Anti-oversell** (chống đặt hàng quá số lượng tồn kho) bằng kỹ thuật DB Transaction + Row lock.
4. **Discount & Coupon:** Tạo mã giảm giá, giới hạn lượt dùng, xác thực tính hợp lệ.
5. **Inventory:** Quản lý lịch sử nhập xuất kho.
6. **CMS Settings:** Lưu trữ cấu hình giao diện trang chủ động (Banners, Promo cards) cho Frontend.

## 🛠️ Hướng dẫn cài đặt & Khởi chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` dựa trên `.env.example` và điền thông tin Database, JWT Secret, cấu hình gửi Mail, v.v.

### 3. Khởi tạo Database (Prisma)
Chạy lệnh sau để migrate các bảng vào MySQL:
```bash
npx prisma migrate dev --name init
```
Nếu đã có sẵn schema, có thể generate Prisma Client:
```bash
npx prisma generate
```

### 4. Chạy Server
**Môi trường Dev:**
```bash
npm run dev
```
Server sẽ mặc định chạy tại `http://localhost:3000`.

**Môi trường Production:**
```bash
npm run build
npm start
```

### 5. Chạy với Docker (Tùy chọn)
Nếu bạn không muốn cài đặt Node.js và MySQL thủ công, dự án đã có sẵn cấu hình Docker. Chỉ cần chạy:
```bash
docker-compose up -d
```
Hệ thống sẽ tự động build image và chạy cả container Backend lẫn MySQL.

## 📂 Cấu trúc thư mục chính
```text
├── src/
│   ├── config/        # Cấu hình DB, Cloudinary/Multer, Nodemailer
│   ├── controllers/   # Xử lý logic Request/Response (Nhận input, trả output)
│   ├── middlewares/   # JWT Auth, Role Guard, Validate request
│   ├── routes/        # Định nghĩa các Endpoints (API)
│   ├── services/      # Chứa Business logic (Tương tác DB)
│   ├── utils/         # Hàm tiện ích (Send mail, Hash, Format...)
│   └── validations/   # Schema kiểm tra dữ liệu đầu vào (Zod/Joi)
├── prisma/            # Chứa file schema.prisma và thư mục migrations
└── docs/              # Tài liệu API (api-reference.md), Kế hoạch (ecommerce-mvp-plan.md)
```

## 📖 API Documentation
Xem danh sách toàn bộ API tại file: `/docs/api-reference.md`.
Chi tiết luồng kiến trúc và Database Design xem tại: `/docs/ecommerce-mvp-plan.md`.
