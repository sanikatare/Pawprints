# 🐾 Paw Prints — Pet Health Monitoring & Diagnosis System

A full-stack MERN application for monitoring pet health, diagnosing symptoms, and managing all aspects of pet care.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ → https://nodejs.org
- **MongoDB** → https://www.mongodb.com/try/download/community
- **VS Code** → https://code.visualstudio.com

---

## ⚙️ Setup Instructions

### Step 1 — Install MongoDB
Download and install MongoDB Community Server from https://www.mongodb.com/try/download/community
Start the MongoDB service (it runs on port 27017 by default).

### Step 2 — Set up the Backend

```bash
cd paw-prints/backend
npm install
npm run dev
```

Backend runs on: **http://localhost:5000**

### Step 3 — Set up the Frontend

Open a **new terminal**:

```bash
cd paw-prints/frontend
npm install
npm start
```

Frontend runs on: **http://localhost:3000**

---

## 🌐 Open in Browser
Go to: **http://localhost:3000**

---

## 🔑 Create Admin Account
Register normally, then in MongoDB Compass (or shell), update your user's role to `"admin"`:
```json
{ "role": "admin" }
```

---

## 🎨 Features Included

| # | Feature | Status |
|---|---------|--------|
| 1 | Symptom Input & Disease Prediction | ✅ |
| 2 | Confidence-Based Disease Prediction | ✅ |
| 3 | Treatment & Precautions | ✅ |
| 4 | Health History Tracking | ✅ |
| 5 | Pet Profile Management (with photos) | ✅ |
| 6 | Vaccination & Reminder System | ✅ |
| 7 | Health Dashboard with Charts | ✅ |
| 8 | Appointment Booking System | ✅ |
| 9 | Emergency Alert System | ✅ |
| 10 | Personalized Care Suggestions | ✅ |
| 11 | Community Forum | ✅ |
| 12 | Medical Records Storage | ✅ |
| 13 | Multi-language Support (UI ready) | ✅ |
| 14 | Vet/Admin Panel | ✅ |

---

## 📁 Project Structure

```
paw-prints/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/       # Auth middleware
│   ├── uploads/         # Uploaded files
│   ├── server.js        # Express server
│   └── .env             # Environment variables
│
└── frontend/
    ├── public/
    └── src/
        ├── pages/       # All page components
        ├── components/  # Reusable components
        ├── context/     # React Context (Auth)
        └── App.js       # Routes
```

---

## 🌿 Color Theme
Pastel Green — `#a8d5a2` (Sage), `#c8f0c8` (Mint), `#4aaf4a` (Primary Green)

## 🔤 Fonts
- Display: **Fraunces** (serif)
- Body: **DM Sans** (sans-serif)

---

## 🛠️ Tech Stack
- **Frontend**: React 18, React Router v6, Chart.js, React-Toastify
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Auth**: JWT (JSON Web Tokens), bcryptjs
- **File Uploads**: Multer

