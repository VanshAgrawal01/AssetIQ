# AssetIQ — Intelligent IT Asset & Employee Lifecycle Manager

<div align="center">

![AssetIQ Banner](https://img.shields.io/badge/AssetIQ-IT%20Asset%20Management-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0yMCA3SDRjLTEuMSAwLTIgLjktMiAydjEwYzAgMS4xLjkgMiAyIDJoMTZjMS4xIDAgMi0uOSAyLTJWOWMwLTEuMS0uOS0yLTItMnptMCAxMkg0VjloMTZ2MTB6TTIgNWgyMFY0YzAtLjU1LS40NS0xLTEtMUgzYy0uNTUgMC0xIC40NS0xIDF2MXoiLz48L3N2Zz4=)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)


**A full-stack IT Asset Management System with AI-powered insights, QR tracking, automated alerts, and complete employee lifecycle management.**

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [API Docs](#api-documentation) • [Screenshots](#screenshots)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**AssetIQ** is a production-grade IT Asset Management System built to solve a real problem every organization faces — tracking devices, managing employee lifecycles, and preventing asset loss.

### Problem Statement
Organizations struggle to track IT assets throughout their lifecycle. Devices are lost during employee exits, warranty renewals are missed, damage history is scattered, and IT teams lack visibility into asset health.

### Solution
AssetIQ provides a centralized platform for:
- 📦 **Asset tracking** from procurement to retirement
- 👥 **Employee lifecycle** management (onboarding → offboarding)
- 🤖 **AI-powered insights** using Gemini API
- 📱 **QR code scanning** for instant asset identification
- 📧 **Automated email alerts** for warranty, offline devices & exits
- 📊 **Analytics & Reports** with PDF export

---

## ✨ Features

### Core Modules

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | JWT-based auth with 3 role levels |
| 👥 **Employee Management** | Complete lifecycle from joining to exit |
| 💻 **Asset Registry** | Full device tracking with health scoring |
| 📦 **Assignments** | Assign/return with PDF handover receipts |
| 🔧 **Damage Reports** | Photo upload, repair tracking, resolution |
| 🏭 **Supplier Management** | Vendor profiles, SLA tracking |
| 📋 **Return Checklist** | Automated offboarding asset recovery |
| 📥 **Asset Requests** | Request → Approve/Reject workflow |
| 🌐 **IP Monitoring** | Network tracking, duplicate IP detection |
| 📊 **Analytics** | 6 interactive charts with Recharts |
| 📄 **PDF Reports** | 4 report types with download |
| 🔔 **Notifications** | Real-time bell with email alerts |
| 📋 **Audit Logs** | Complete action history |
| 🤖 **AI Assistant** | Plain English DB queries via Gemini |

### Standout Features

#### 📱 QR Code Scanning
Every asset gets an auto-generated QR code. Scan with any phone — no login required — to see full asset details, owner, health score, and repair history.

#### 🤖 AI Chat Assistant
Ask plain English questions about your data:
- *"Which assets are currently under repair?"*
- *"Who hasn't returned their device?"*
- *"Which laptops have low health scores?"*

#### 📊 Asset Health Score
Automatic scoring algorithm (0-100):
```
Score = 100 - (Age × 10) - (Damage × 5) - (Repairs × 8) - (Offline Days × 1)
```
- 🟢 **80-100** — Excellent
- 🟡 **40-79**  — Good
- 🔴 **0-39**   — Critical

#### ⏰ Automated Cron Alerts
Three daily automated checks:
- **Warranty expiring** in 30 days → Email alert
- **Device offline** for 7+ days → Email alert
- **Employee exit** in 3 days with pending returns → Email alert

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js + Express.js** | REST API server |
| **PostgreSQL + Prisma ORM** | Database & query layer |
| **JWT + bcrypt** | Authentication & security |
| **PDFKit** | PDF generation |
| **Multer** | File/photo upload |
| **Nodemailer** | Email alerts |
| **node-cron** | Scheduled jobs |
| **qrcode** | QR code generation |
| **Gemini API** | AI chat assistant |
| **express-validator** | Input validation |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js 18** | UI framework |
| **Tailwind CSS** | Styling |
| **React Router v6** | Client-side routing |
| **Axios** | API communication |
| **Recharts** | Analytics charts |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL database (cloud) |
| **Railway** | Backend deployment |
| **Vercel** | Frontend deployment |
| **Cloudinary** | Image storage |

---

## 📁 Project Structure

```
AstraIQ/
│
├── assetiq-backend/
│   ├── prisma/
│   │   ├── schema.prisma          # 11 database tables
│   │   └── seed.js                # Sample data
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Database connection
│   │   │   ├── email.js           # Nodemailer config
│   │   │   ├── ai.js              # Gemini API config
│   │   │   └── cloudinary.js      # Image storage config
│   │   │
│   │   ├── routes/                # 13 route files
│   │   ├── controllers/           # 13 controller files
│   │   ├── services/              # 6 service files
│   │   ├── repositories/          # 6 repository files
│   │   ├── validators/            # 5 validator files
│   │   ├── middleware/            # 5 middleware files
│   │   ├── jobs/                  # 3 cron job files
│   │   ├── utils/                 # 4 utility files
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── uploads/
│   │   ├── damage-images/
│   │   ├── signatures/
│   │   └── certificates/
│   │
│   ├── .env
│   └── package.json
│
└── assetiq-frontend/
    ├── src/
    │   ├── pages/                 # 15 page components
    │   ├── components/
    │   │   └── common/            # Sidebar, Navbar, Layout
    │   ├── api/                   # Axios instance + API calls
    │   ├── context/               # AuthContext
    │   ├── hooks/                 # Custom hooks
    │   └── utils/                 # Helper functions
    │
    ├── .env
    └── package.json
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Assetiq.git
cd Assetiq
```

### 2. Backend Setup

```bash
cd assetiq-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Setup database
npx prisma db push
npx prisma generate

# Seed sample data
node prisma/seed.js

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd assetiq-frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Start development server
npm start
```

### 4. Access the App

```
Frontend  →  http://localhost:3000
Backend   →  http://localhost:5000
API Docs  →  http://localhost:5000/ping
```

---

## 🔐 Environment Variables

### Backend `.env`

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/assetiq"

# JWT
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=development

# Email (Gmail)
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# AI
GEMINI_API_KEY="your-gemini-api-key"

# Frontend URL
CLIENT_URL="http://localhost:3000"
```

### Frontend `.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production:  https://your-railway-url.up.railway.app/api
```

### Authentication
All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints Summary

#### 🔐 Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login & get token | Public |
| GET | `/auth/me` | Get current user | Protected |

#### 👥 Employees
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/employees` | List all employees | All |
| GET | `/employees/:id` | Get employee detail | All |
| POST | `/employees` | Create employee | Admin |
| PUT | `/employees/:id` | Update employee | Admin, IT |
| DELETE | `/employees/:id` | Soft delete | Admin |

#### 💻 Assets
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/assets` | List all assets | All |
| GET | `/assets/:id` | Get asset detail | All |
| GET | `/assets/scan/:code` | QR scan (public) | Public |
| GET | `/assets/stats/dashboard` | Dashboard stats | All |
| POST | `/assets` | Create asset | Admin, IT |
| PUT | `/assets/:id` | Update asset | Admin, IT |

#### 📦 Assignments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/assignments` | List all | All |
| GET | `/assignments/employee/:id` | Employee assets | All |
| POST | `/assignments/assign` | Assign asset | Admin, IT |
| POST | `/assignments/return` | Return asset | Admin, IT |

#### 🔧 Damage Reports
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/damage` | List all reports | All |
| GET | `/damage/:id` | Get report | All |
| POST | `/damage` | Submit report | Employee |
| PUT | `/damage/:id` | Review report | Admin, IT |

#### 🤖 AI
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/ai/ask` | Ask AI question | Admin, IT |

#### 📄 Reports
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/reports/assets` | Asset PDF report | Admin, IT |
| GET | `/reports/employees` | Employee PDF report | Admin, IT |
| GET | `/reports/damage` | Damage PDF report | Admin, IT |
| GET | `/reports/full` | Full system report | Admin, IT |

#### 🔔 Notifications
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/notifications` | Get notifications | All |
| POST | `/notifications` | Create notification | Admin, IT |
| PUT | `/notifications/:id/read` | Mark read | All |
| PUT | `/notifications/read-all` | Mark all read | All |
| GET | `/notifications/test-email` | Test email | Admin |

#### 📋 Audit Logs
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/audit` | Get all logs | Admin, IT |
| GET | `/audit/entity/:id` | Get entity logs | Admin, IT |

---

## 👤 User Roles

### ADMIN
- Full access to all features
- Manage users, employees, assets
- View all reports and audit logs
- Approve/reject asset requests
- Configure system settings

### IT_MANAGER
- Manage assets and assignments
- Review damage reports
- Approve asset requests
- Monitor alerts
- Generate reports

### EMPLOYEE
- View own assigned assets
- Submit damage reports
- View personal dashboard

---

## 🗄 Database Schema

```
users ──────────────────────────────────────────────────────
  id, name, email, password(hashed), role, createdAt

employees ──────────────────────────────────────────────────
  id, userId*, employeeCode, department, designation
  phone, joinDate, exitDate, isActive

assets ─────────────────────────────────────────────────────
  id, assetCode, name, type, brand, model, serialNumber
  purchaseDate, warrantyExpiry, status, condition
  healthScore, qrCode, supplierId*

suppliers ──────────────────────────────────────────────────
  id, name, contactEmail, contactPhone, address
  contractDate, slaDays

assignments ────────────────────────────────────────────────
  id, employeeId*, assetId*, assignedDate, returnedDate
  isActive, receiptUrl, notes

asset_requests ─────────────────────────────────────────────
  id, employeeId*, assetId*, assetType, status
  reason, rejectedNote

damage_reports ─────────────────────────────────────────────
  id, assetId*, employeeId*, description, photoUrl
  repairCost, status, resolvedAt

ip_logs ────────────────────────────────────────────────────
  id, assetId*, ipAddress, macAddress, lastSeen, isDuplicate

return_checklists ──────────────────────────────────────────
  id, employeeId*, assetId*, status, checkedAt, notes

audit_logs ─────────────────────────────────────────────────
  id, userId*, action, entity, entityId, oldValue, newValue

notifications ──────────────────────────────────────────────
  id, title, message, type, isRead, targetRole
```

---

## 🌐 Deployment

### Deploy to Production

#### 1. Database — Supabase
```bash
# Update DATABASE_URL in .env to Supabase URL
npx prisma db push
node prisma/seed.js
```

#### 2. Backend — Railway
1. Connect GitHub repo to Railway
2. Add environment variables
3. Deploy automatically

#### 3. Frontend — Vercel
1. Connect GitHub repo to Vercel
2. Add `REACT_APP_API_URL` environment variable
3. Deploy automatically

## 📊 Project Stats

```
Backend Files    →  45+
Frontend Files   →  20+
API Endpoints    →  35+
Database Tables  →  11
Pages            →  15
Charts           →  6
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 👨‍💻 Author

**Vansh Agrawal**

[![GitHub](https://img.shields.io/badge/GitHub-vansh-181717?style=flat-square&logo=github)](https://github.com/vansh)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com)

---

<div align="center">

**Built with Node.js, Express.js, React, PostgreSQL, Prisma ORM and Gemini AI.**

⭐ Star this repo if you found it helpful!


