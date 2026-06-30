# 🤝 Aidora — Connecting Hearts, Empowering Change

### 🌐 Live Deployments
* **Frontend**: [https://crowd-fund-ecru.vercel.app/](https://crowd-fund-ecru.vercel.app/)
* **Backend**: [https://crowdfund-oopg.onrender.com](https://crowdfund-oopg.onrender.com)

[![React](https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green.svg?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

Welcome to **Aidora**! 🌟 We believe that big changes start with small actions. This project is a full-stack crowdfunding platform designed to bring people together—helping passionate creators, community leaders, and individuals raise the funds they need to make the world a slightly better place. 

Unlike generic platforms, Aidora focuses on **transparency and trust**. We introduce identity checks and tangible donation packages so that every supporter knows *exactly* where their hard-earned money is going.

---

## 📖 The Story & Features

Here is what makes Aidora special:

* **🛡️ Built on Trust (Aadhaar Verification)**: To keep our community safe, every campaign creator must verify their identity using a mock Aadhaar integration before launching a fund. No anonymous spam, just real people.
* **🎁 Real Impact (Donation Kits)**: Ever wondered what a $20 donation actually does? With our **Donation Kits**, donors can purchase real-world items (like a "School Kit" or "First Aid Kit") directly for a project. 
* **⚡ Live Updates (Interactive Tracker)**: Watch the impact happen in real-time. Our dynamic progress bars and live donor ticker show support as it rolls in.
* **📱 Share the Love**: Built-in WhatsApp sharing makes it incredibly simple to tell friends, family, and networks about campaigns that matter.
* **🔐 Secure Space**: Powered by secure JWT authentication and password hashing, keeping user data and profiles safe.

---

## 🛠️ What's Under the Hood?

We built this project using the **MERN** stack to keep it fast, responsive, and robust:

* **Frontend**: React 19, TypeScript, and Tailwind CSS for a sleek, responsive, and modern look.
* **Backend**: Node.js & Express.js handling a clean REST API structure.
* **Database**: MongoDB & Mongoose storing campaigns, donor lists, and secure user profiles.

---

## 📂 The Tour Guide (Project Map)

If you're exploring the codebase, here is where you'll find everything:

* **`Frontend/`**: The visual heart of the app. It holds all our React pages (Home, Profile, campaigns) and custom UI components (like the interactive progress bars and modals).
* **`Backend/`**: The engine room. Contains our database models (Users, Funds, Donations), routing, secure JWT gateways, and controllers that power the features.

---

## 🚀 Setting Up Your Copy

Want to run Aidora locally? We've made it as simple as possible.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) set up on your machine.

### Step 1: Start your database
Make sure your MongoDB server is up and running:
```bash
mongod
```

### Step 2: Fire up the Backend
1. Go to the `Backend` folder:
   ```bash
   cd Backend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Set up a `.env` file (you can copy `.env.example`):
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/aidora
   JWT_SECRET=choose_a_secure_secret_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The API will be live at http://localhost:4000*

### Step 3: Run the Frontend
1. Open a new terminal and go to the `Frontend` folder:
   ```bash
   cd Frontend
   ```
2. Install the frontend packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
   *Your browser will automatically open http://localhost:3000*

---

## 🔌 API Cheatsheet

For developers looking to integrate or test, here are the main routes:

* **Authentication**: `/api/auth/signup` & `/api/auth/login`
* **Profiles & Trust**: `/api/auth/me` (Profile data) & `/api/verify/aadhaar` (Verification)
* **Campaigns**: `/api/funds` (Get all or create) & `/api/funds/:id` (Details)
* **Donations**: `/api/donations` (Make a donation) & `/api/donations/:fundId` (View contributors)

---

## 💡 Quick Tip for Testing
To launch your first test campaign:
1. Register a new account and log in.
2. Visit `/verify` and enter a mock 12-digit ID to verify the account.
3. Head to `/create` to fill out your fundraising campaign!
4. *(Optional)* Toggle the new campaign status to `"Active"` directly in your MongoDB collection to make it visible on the explore page.
