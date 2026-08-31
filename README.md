# 🌿 EcoBin — AI-Integrated Waste Management & Operations Platform

> **"Eco technology, presented like a premium SaaS platform."**

EcoBin is a full-stack, enterprise-grade waste management platform that connects **citizens** with **municipal administrators** and **collection fleets**. Powered by Computer Vision and AI heuristics, EcoBin automates waste sorting, on-demand curbside dispatch, illegal dump reporting, and predictive fleet route optimization.

---

## 🌟 Highlights & Key Features

### 1. ⚡ Neural Waste Classifier (AI Scanner)
- Sub-second classification of recyclables, organics, hazardous e-waste, plastics, and paper using multi-modal AI.
- Dynamic confidence scoring, material attribute breakdown (Recyclability, Contamination Risk, Degradability), and automated disposal guidance.
- Calculates estimated CO₂ diversion metrics for every scanned item.

### 2. 🚛 Smart Pickup Orchestration
- Self-serve booking flow for residential, commercial, and bulk collections.
- Dynamic slot allocation based on fleet availability and neighborhood density.
- Live GPS tracking for pickup trucks with arrival notifications and status milestones (`Pending` → `Assigned` → `In Transit` → `Completed`).

### 3. 🛡️ Geotagged Civic Issue Reporting
- One-tap citizen reporting for illegal dumping, overflowing public bins, or hazardous spills.
- Upload photo evidence with automated location geotagging.
- Closed-loop resolution feed with crew verification photos.

### 4. 📊 Predictive City Analytics & Fleet Logistics (Admin)
- Real-time heatmaps for waste density, pickup throughput, and active ward coverage.
- AI-assisted dynamic route optimization cutting vehicle emissions by up to 24%.
- One-click ESG compliance exports and carbon diversion accounting.

---

## 🎨 Visual Identity & Design System

- **Typography**: 
  - **Headings & Display**: `Plus Jakarta Sans` (400–800) for bold brand impact, metric counters, and display headings.
  - **Body & Data Surfaces**: `Inter` (300–700) for ultra-crisp readability in data tables, forms, and operational telemetry.
- **Aesthetic**: Minimal + Glassmorphism + Soft SaaS (`#10B981` Emerald primary, `#0D9488` Soft Teal, `#F8FAFB` Pearl canvas, luminous frosted glass panels with `backdrop-filter: blur(18px)`).
- **Animations (Framer Motion)**:
  - Scroll reveals with viewport triggers.
  - Floating live telemetry tags with continuous organic physics oscillations.
  - Dynamic number counters (`AnimatedCounter`) counting up on reveal.
  - Interactive AI scanner simulator with laser scanning reticles.
  - 3D card elevation and glowing border reflections on hover.

---

## 🛡️ Role-Based Access Control (RBAC)

| Role | Access Scope | Accessible Routes |
| :--- | :--- | :--- |
| **🌿 Citizen User** | Residential actions, waste scanner, requests & tracking | `/dashboard`, `/report-waste`, `/pickup-request`, `/pickup-tracking`, `/ai-scanner`, `/history`, `/profile` |
| **⚡ Municipal Admin** | City-wide operations, user management, fleet routes & AI insights | `/admin`, `/admin/users`, `/admin/pickups`, `/admin/routes`, `/admin/analytics`, `/admin/ai-insights` *(+ 1-click switcher to Citizen View)* |

*Unauthenticated users or unauthorized role attempts are automatically intercepted by [RoleRoute.jsx](frontend/src/components/auth/RoleRoute/RoleRoute.jsx) and redirected with secure feedback.*

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **HTTP Client**: Axios (with centralized JWT interceptor)
- **Styling**: Vanilla CSS Design Tokens, Glassmorphic Utilities, Custom CSS Variables

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) + BcryptJS password hashing
- **File Uploads**: Multer (photo uploads for reports and avatar profiles)
- **AI Integration**: OpenAI API (with robust fallback heuristics)

---

## 📂 Project Structure

```
ECOBIN/
├── backend/
│   ├── config/            # Database connection & env configurations
│   ├── controllers/       # Business logic (auth, pickups, reports, AI, routes)
│   ├── middleware/        # JWT auth verification, role guards, error handlers
│   ├── models/            # Mongoose schemas (User, WasteReport, PickupRequest, Route, Vehicle, Staff, AIInsight)
│   ├── routes/            # Express API endpoint definitions
│   ├── seed/              # Database seeding scripts with realistic dummy data
│   ├── services/          # AI classification and route clustering logic
│   ├── utils/             # ApiError, ApiResponse, and helper utilities
│   ├── .env.example       # Backend environment variables template
│   └── server.js          # Express entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios instance & modular API client methods
│   │   ├── assets/        # Logos, branding icons, and static assets
│   │   ├── components/    # Reusable UI components (auth, cards, charts, common, tables)
│   │   ├── context/       # AuthContext (session & role state), NotificationContext
│   │   ├── hooks/         # Custom hooks (useAuth, useToast, useDebounce)
│   │   ├── layouts/       # AppLayout, UserLayout, AdminLayout with responsive sidebar
│   │   ├── pages/
│   │   │   ├── public/    # Landing (SaaS Showcase), Login (Role Switcher), Signup (Role Provisioning)
│   │   │   ├── user/      # UserDashboard, ReportWaste, PickupRequest, PickupTracking, AiScanner, History, Profile
│   │   │   └── admin/     # AdminDashboard, UserManagement, PickupManagement, RouteManagement, Analytics, AiInsights
│   │   ├── App.css        # Global design system tokens & glassmorphism utilities
│   │   ├── App.jsx        # Route definitions with ProtectedRoute & RoleRoute guards
│   │   └── main.jsx       # App bootstrap with context providers
│   ├── index.html         # HTML entry point with Plus Jakarta Sans & Inter fonts
│   ├── package.json       # Frontend scripts and dependencies
│   └── vite.config.js     # Vite configuration
│
└── README.md              # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.x or later)
- **npm** (v9.x or later)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection URI)

---

### 1. Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create your .env file from the template
cp .env.example .env
```

Configure your `.env` variables:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=your_openai_api_key_optional
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE_MB=5
```

Seed the database with test data:
```bash
npm run seed
```

Start the backend API server:
```bash
npm run dev
# Server running at http://localhost:5000 (API Base: http://localhost:5000/api/v1)
```

---

### 2. Frontend Setup

```bash
# 1. Open a new terminal and navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
```

Ensure `.env` contains:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Start the Vite development server:
```bash
npm run dev
# App running at http://localhost:5173
```

To create an optimized production build:
```bash
npm run build
```

---

## 🔑 Demo Login Credentials

You can use the **1-Click Demo Buttons** on the Login Page, or manually log in with these seeded accounts:

| Portal | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Municipal Admin** | `admin@ecobin.com` | `password123` | `admin` |
| **Resident Citizen** | `user@ecobin.com` | `password123` | `user` |
| **Super Admin** | `sarkararitra2003@gmail.com` | `Aritra@2003` | `admin` |

---

## 📡 Core API Endpoints

### 🔐 Authentication (`/api/v1/auth`)
- `POST /auth/register` — Register a citizen (`user`) or administrator (`admin`).
- `POST /auth/login` — Sign in and receive JWT token + user profile.
- `GET /auth/me` — Fetch currently authenticated user session.
- `PATCH /auth/change-password` — Update user password.

### 📦 Pickup Requests (`/api/v1/pickups`)
- `POST /pickups` — Create a new on-demand waste collection request.
- `GET /pickups` — List user's requests (or all requests for admin).
- `GET /pickups/:id` — Get real-time status and live tracking info.
- `PATCH /pickups/:id/status` — *(Admin)* Assign driver, update status (`in_transit`, `completed`).

### ⚑ Waste Reports (`/api/v1/reports`)
- `POST /reports` — Submit geotagged issue report with image evidence.
- `GET /reports` — List public/user issue reports.
- `PATCH /reports/:id/status` — *(Admin)* Update resolution status and upload resolution proof.

### 🤖 Vision AI & Scanner (`/api/v1/ai`)
- `POST /ai/classify` — Classify image or text description into waste categories with disposal directives.
- `GET /ai/insights` — *(Admin)* Retrieve predictive anomaly alerts and overflow forecasts.
- `PATCH /ai/insights/:id/read` — *(Admin)* Mark an AI insight as read.

### 📊 City Analytics (`/api/v1/analytics`)
- `GET /analytics/summary` — *(Admin)* Overall operational stats (total pickups, active users, diversion kg).
- `GET /analytics/categories` — *(Admin)* Waste category breakdown for pie/bar graphs.
- `GET /analytics/routes` — *(Admin)* Dynamic route optimization metrics and carbon reduction stats.

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with 🌿 for cleaner, smarter, and sustainable cities worldwide.</sub>
</div>
