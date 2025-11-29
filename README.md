# HealthCare - Nền tảng Cộng đồng Y tế

Ứng dụng web hỗ trợ cộng đồng chia sẻ thông tin y tế, đặt câu hỏi sức khỏe và nhận tư vấn từ AI Assistant.

## 🚀 Cài đặt và Chạy

### Yêu cầu
- Node.js >= 16
- MySQL >= 8.0

### 1. Clone & Cài đặt
```bash
git clone https://github.com/quan4451190100/HealthCare.git
cd HealthCare
```

### 2. Setup Backend
```bash
cd BE
npm install
```

Tạo file `BE/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=healthcare_db

JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

FE_URL=http://localhost:5173
```

Tạo database:
```sql
CREATE DATABASE healthcare_db;
```

Chạy Backend:
```bash
npm run dev
```
→ Backend: `http://localhost:5000`

### 3. Setup Frontend
```bash
cd FE
npm install
```

Tạo file `FE/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Chạy Frontend:
```bash
npm run dev
```
→ Frontend: `http://localhost:5173`

## 🛠️ Tech Stack

**Backend:** Node.js, Express, TypeScript, MySQL, JWT, Passport (Google OAuth)  
**Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui

## 📧 Liên hệ

GitHub: [@quan4451190100](https://github.com/quan4451190100)
