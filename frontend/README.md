# Event QR Validator - Frontend

Modern, fast, and responsive React + Vite + TypeScript web application for Event & Graduation Day QR Code pass verification, attendance scanning, and admin dashboard.

## 🚀 Features

- **Candidate QR Pass Portal**: Search and download verified attendance QR passes.
- **Admin Dashboard**: Live statistics, attendance rate tracking, and event monitoring.
- **Camera & Hardware QR Scanner**: Fast scanning with real-time audio and visual feedback.
- **Excel/CSV Candidate Import Engine**: Bulk candidate verification and data synchronization.
- **Ceremony Event Switching**: Multi-event support with instant gate pass validation.
- **Mobile & Desktop Responsive**: Optimized for handheld scanners, smartphones, tablets, and desktop workstations.

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Lucide Icons
- **Scanner**: html5-qrcode
- **Routing**: React Router DOM (v6)

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set `VITE_API_URL` if your backend is hosted separately:
```env
VITE_API_URL="http://localhost:5000"
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## 📄 License
MIT
