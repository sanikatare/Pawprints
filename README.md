# PawPrints – Pet Health Monitoring & Diagnosis System

## Overview

Paw Prints is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application designed to help pet owners monitor, manage, and track the health of their pets through a centralized digital platform.

The system enables users to maintain pet profiles, store medical records, monitor vaccination schedules, track health history, receive symptom-based disease predictions, schedule veterinary appointments, and access personalized care recommendations. The platform provides secure authentication, role-based access control, and a responsive user interface for an efficient user experience.

The primary objective of this project is to provide pet owners with an organized and accessible solution for pet healthcare management while promoting early detection of potential health issues.

---


### Prerequisites
- **Node.js** v16+ → https://nodejs.org
- **MongoDB** → https://www.mongodb.com/try/download/community
- **VS Code** → https://code.visualstudio.com

## Table of Contents

1. Features
2. Technology Stack
3. System Architecture
4. Project Structure
5. Installation Guide
6. Environment Variables
7. Database Configuration
8. Running the Application
9. User Roles
10. API Overview
11. Security Features
12. Future Enhancements
13. Testing
14. Deployment
15. Contributors
16. License

---

## Features

### Authentication & Authorization

* User registration and login
* JWT-based authentication
* Password encryption using bcrypt
* Protected routes
* Role-based access control
* Admin dashboard access

### Pet Management

* Create pet profiles
* Upload pet photographs
* Update pet information
* Manage multiple pets under a single account
* Store breed, age, gender, and health information

### Symptom-Based Diagnosis

* Enter pet symptoms
* Disease prediction engine
* Confidence-based diagnosis results
* Treatment suggestions
* Preventive care recommendations
* Diagnosis history storage

### Health History Tracking

* Maintain historical health records
* View previous diagnoses
* Track treatments and outcomes
* Generate health timelines

### Vaccination Management

* Add vaccination records
* Track vaccination schedules
* Monitor upcoming vaccinations
* Reminder support

### Appointment Booking

* Schedule veterinary appointments
* View upcoming appointments
* Manage appointment status
* Appointment history tracking

### Emergency Support

* Emergency assistance module
* Quick-access health guidance
* Critical care information

### Community Forum

* Create discussions
* Share pet care experiences
* Engage with other pet owners
* Community-driven support

### Medical Records

* Store medical reports
* Upload health documents
* Centralized medical history
* Organized record management

### Analytics Dashboard

* Health statistics
* Pet activity insights
* Vaccination summaries
* Diagnosis trends
* Interactive charts and visualizations

### Multilingual Support

* Localization-ready architecture
* Expandable language support

### Administrative Features

* User management
* Data monitoring
* Platform oversight
* Role administration

---

## Technology Stack

### Frontend

* React.js
* React Router DOM
* Axios
* Chart.js
* React Toastify
* CSS3
* HTML5
* JavaScript (ES6+)

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose ODM

### Authentication

* JSON Web Tokens (JWT)
* bcryptjs

### File Handling

* Multer

### Development Tools

* Visual Studio Code
* Git
* GitHub
* Postman

---

## System Architecture

The application follows a three-tier architecture:

### Presentation Layer

React frontend responsible for:

* User interface rendering
* Form handling
* API communication
* Route management
* Dashboard visualization

### Business Logic Layer

Express.js backend responsible for:

* Authentication
* Authorization
* Validation
* Disease prediction logic
* Appointment processing
* Medical record management

### Data Layer

MongoDB database responsible for:

* User data storage
* Pet profile storage
* Diagnosis records
* Vaccination records
* Appointment information
* Medical records

---

## Project Structure

```text
paw-prints/
│
├── backend/
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── adminMiddleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Pet.js
│   │   ├── Diagnosis.js
│   │   ├── Vaccination.js
│   │   ├── Appointment.js
│   │   └── MedicalRecord.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── petRoutes.js
│   │   ├── diagnosisRoutes.js
│   │   ├── vaccinationRoutes.js
│   │   ├── appointmentRoutes.js
│   │   └── adminRoutes.js
│   │
│   ├── uploads/
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   │
│   ├── public/
│   │
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       ├── App.js
│       └── index.js
│
├── README.md
└── .gitignore
```

---

## Installation Guide

## Clone Repository

```bash
git clone https://github.com/your-username/paw-prints.git

cd paw-prints
```

---

## Backend Setup

Navigate to backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=mongodb://localhost:27017/paw-prints

JWT_SECRET=your_jwt_secret_key

NODE_ENV=development
```

Start backend server:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

---

## Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start frontend:

```bash
npm start
```

Frontend URL:

```text
http://localhost:3000
```

---

## Database Configuration

### Local MongoDB

Ensure MongoDB service is running:

```bash
mongod
```

Default database:

```text
paw-prints
```

### MongoDB Atlas (Optional)

Replace local connection string:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/paw-prints
```

---

## Running the Application

### Start Backend

```bash
cd backend
npm run dev
```

### Start Frontend

```bash
cd frontend
npm start
```

Open:

```text
http://localhost:3000
```

---

## User Roles

### Pet Owner

* Manage pets
* View health records
* Request diagnosis
* Track vaccinations
* Book appointments
* Participate in community forum

### Administrator

* Manage users
* Monitor system activities
* Manage records
* Access administrative dashboard
* Oversee platform operations

---

## API Overview

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

### Pets

```http
GET    /api/pets
POST   /api/pets
PUT    /api/pets/:id
DELETE /api/pets/:id
```

### Diagnosis

```http
POST /api/diagnosis
GET  /api/diagnosis/history
```

### Vaccinations

```http
POST /api/vaccinations
GET  /api/vaccinations
PUT  /api/vaccinations/:id
```

### Appointments

```http
POST /api/appointments
GET  /api/appointments
PUT  /api/appointments/:id
```

---

## Security Features

* JWT Authentication
* Password Hashing
* Protected API Routes
* Role-Based Authorization
* Input Validation
* Secure Database Access
* Environment Variable Protection
* File Upload Validation

---

## Testing

The application has been tested for:

* User Authentication
* Registration Flow
* Login Validation
* Pet Management
* Diagnosis Processing
* Vaccination Tracking
* Appointment Scheduling
* Database Operations
* API Response Handling
* Route Protection

---

## Future Enhancements

* AI/ML-powered disease prediction
* Real-time veterinarian chat
* Push notifications
* Mobile application
* Telemedicine integration
* Advanced analytics
* Health trend forecasting
* Wearable device integration
* Cloud storage for medical reports
* Multi-veterinary network support

---

## Deployment

### Frontend

Recommended platforms:

* Vercel
* Netlify

### Backend

Recommended platforms:

* Render
* Railway
* AWS EC2

### Database

Recommended platform:

* MongoDB Atlas

---

## License

This project is developed for educational and academic purposes.

Copyright © 2026 Paw Prints Team.

All rights reserved.


