# 🌟 CrowdFund — MERN Crowdfunding Platform

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

An outstanding, modern, and highly secure full-stack crowdfunding platform designed to connect impact-driven projects with community support. Featuring interactive donation kits, secure identity checks, and real-time contribution tracking.

---

## ✨ Key Features

- **🔐 Secure Authentication**: Robust user signup and login powered by JSON Web Tokens (JWT) and bcrypt hashing.
- **🆔 Aadhaar Verification**: Integrates a mock Aadhaar verification flow to ensure user authenticity before launching campaigns.
- **🚀 Campaign Creation**: Verified users can launch custom fundraising campaigns complete with targets, descriptions, and custom gallery images.
- **📦 Smart Donation Kits**: Interactive product kits (e.g., educational packages, medical supplies) enabling donors to visualize the direct impact of their support.
- **💳 Real-time Donation Tracker**: Live updates of fund progress bars, total amount collected, and a real-time donor ticker.
- **👤 Personalized Dashboards**: Comprehensive user profiles displaying a history of created funds and donation receipts.
- **📱 WhatsApp Sharing**: One-click sharing integration to easily spread the word to friends and family.

---

## 🛠️ Tech Stack

### Frontend
- **Framework & Language**: React 19, TypeScript, Tailwind CSS
- **Routing**: React Router v7
- **Form Handling**: React Hook Form
- **API Client**: Axios

### Backend & Database
- **Runtime & Framework**: Node.js, Express.js
- **Database**: MongoDB (Object Data Modeling via Mongoose)
- **Security**: JWT (JSON Web Tokens), Bcrypt, Express Validator

---

## 📂 Project Structure

```text
/
├── Frontend/          # React Single Page Application
│   └── src/
│       ├── components/   # UI elements (Navbar, ProgressBar, DonorTicker, etc.)
│       ├── pages/        # Home, Explore, FundDetail, Donate, CreateFund, Profile, Verify, Auth
│       ├── services/     # api.ts (handles Backend authentication, funds, and donations APIs)
│       ├── utils/        # Helper utils (donation kits, image data)
│       └── types/        # TypeScript Interfaces
│
└── Backend/           # Express Server & REST APIs
    └── src/
        ├── controllers/  # API Controllers (auth, funds, donations, admin, verification)
        ├── models/       # MongoDB Mongoose Schemas (User, Fund, Donation, Verification)
        ├── routes/       # Express Route definition blocks
        └── middleware/   # JWT Authentication & Authorization Gateways
```

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and [MongoDB](https://www.mongodb.com/) installed and running locally.

### 1. Database Setup
Ensure MongoDB is running locally:
```bash
mongod
```
*Alternatively, you can use MongoDB Atlas. If so, configure the `MONGODB_URI` connection string in your environment file.*

### 2. Backend Server
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file (refer to `.env.example`):
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/crowdfund
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The server runs at [http://localhost:4000](http://localhost:4000)*

### 3. Frontend Web Client
1. Navigate to the `Frontend` directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   *The application opens automatically at [http://localhost:3000](http://localhost:3000)*

---

## 🔌 API Documentation

| Method | Endpoint | Auth Required | Description |
|:---|:---|:---:|:---|
| **POST** | `/api/auth/signup` | ❌ No | Register a new user |
| **POST** | `/api/auth/login` | ❌ No | Authenticate user & get token |
| **GET** | `/api/auth/me` | 🔒 Yes | Retrieve currently logged-in user profile |
| **POST** | `/api/verify/aadhaar` | 🔒 Yes | Verify user identity via mock Aadhaar system |
| **POST** | `/api/funds` | 🔒 Yes (Verified) | Launch a new crowdfunding campaign |
| **GET** | `/api/funds` | ❌ No | Retrieve all active crowdfunding campaigns |
| **GET** | `/api/funds/:id` | ❌ No | Retrieve specific campaign details |
| **GET** | `/api/funds/user/my-funds` | 🔒 Yes | List campaigns created by the current user |
| **POST** | `/api/donations` | 🔓 Optional | Submit a new donation to a campaign |
| **GET** | `/api/donations/:fundId` | ❌ No | Fetch donations list for a specific campaign |
| **GET** | `/api/donations/my` | 🔒 Yes | Get history of donations made by the current user |

---

## 💡 How to Launch a Test Campaign

1. **Sign Up & Log In**: Create a test account through the signup page.
2. **Verify Identity**: Go to the `/verify` route and submit a mock 12-digit Aadhaar number along with matching details.
3. **Submit Campaign**: Once verified, access the Create Campaign form via `/create` and fill in the details.
4. **Activate Campaign**: By default, new campaigns may require an active status. You can update the campaign's status field to `"Active"` directly in your MongoDB instance or use the admin panel features.
