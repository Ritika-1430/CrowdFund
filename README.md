# Crowdfunding Web App — MERN Stack

A full-stack crowdfunding platform built with React, Node.js, Express, and MongoDB.

## What's Working

- ✅ User Signup & Login (JWT auth)
- ✅ Aadhaar Verification (mock)
- ✅ Create Fund (requires verified account)
- ✅ Browse/Explore Active Funds
- ✅ Fund Detail with donation kits
- ✅ Donate (real API, updates fund amount)
- ✅ Profile — My Funds + My Donations history
- ✅ Share fund via WhatsApp

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, React Router v7, Axios, React Hook Form
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcrypt
- **Validation**: express-validator, yup

## Quick Start

### 1. MongoDB
Make sure MongoDB is running locally:
```bash
mongod
```
Or use MongoDB Atlas — update `MONGODB_URI` in `server/.env`

### 2. Backend
```bash
cd server
npm install
npm run dev
```
Server runs on: http://localhost:4000

### 3. Frontend
```bash
cd client
npm install
npm start
```
App runs on: http://localhost:3000

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/signup | No | Register |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get profile |
| POST | /api/funds | Yes + Verified | Create fund |
| GET | /api/funds | No | List all funds |
| GET | /api/funds/:id | No | Get fund detail |
| GET | /api/funds/user/my-funds | Yes | My funds |
| POST | /api/verify/aadhaar | Yes | Aadhaar verify |
| POST | /api/donations | Optional | Donate to fund |
| GET | /api/donations/:fundId | No | Fund donations |
| GET | /api/donations/my | Yes | My donations |

## How to Create a Test Fund

1. Sign up → Login
2. Go to /verify → Enter any 12-digit number + name + phone
3. After verification → Go to /create → Fill form
4. **Important**: Set fund status to 'Active' in MongoDB
   (or add admin approve feature)

## Project Structure

```
/
├── client/          # React frontend
│   └── src/
│       ├── pages/        # Home, Explore, FundDetail, Donate, CreateFund, Profile, Auth, Verify
│       ├── components/   # Navbar, FundCard, DonationAmountModal, etc.
│       ├── services/     # api.ts (authApi, fundApi, donationApi, verifyApi)
│       ├── hooks/        # useAuth
│       └── utils/        # donationKits.ts
├── server/          # Express backend
│   └── src/
│       ├── controllers/  # authController, fundController, donationController, verifyController
│       ├── models/       # User, Fund, Donation, Verification
│       ├── routes/       # auth, funds, donations, verify
│       └── middleware/   # auth (JWT)
```
