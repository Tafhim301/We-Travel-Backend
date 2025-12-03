# 🌍 We-Travel Backend API

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.8+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.1+-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v8.16+-13AA52?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)

**A Modern Travel Planning Social Platform Backend**

Connecting travelers worldwide to share travel ideas, collaborate on tours, and create unforgettable journeys together.

[Documentation](#documentation) • [Quick Start](#quick-start) • [API Routes](#api-routes) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Documentation](#documentation)
- [API Routes](#api-routes)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Contributing](#contributing)

---

## Project Overview

**We-Travel** is a sophisticated backend API for a travel planning social platform where users can:

- 📍 **Post Travel Plans** - Share travel ideas with detailed itineraries
- 👥 **Collaborate** - Join other travelers' tours and co-create experiences
- ⭐ **Review & Rate** - Leave reviews and ratings for hosts and experiences
- 💳 **Manage Subscriptions** - Premium features with SSLCommerz payment integration
- 📊 **Analytics Dashboard** - Comprehensive admin and user statistics
- 🏆 **Social Features** - Interests, locations, and travel communities

The platform uses a **modular, production-ready architecture** with proper error handling, authentication, authorization, and business logic separation.

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **User Management** | Registration, authentication, profile management, role-based access |
| **Travel Planning** | Create and manage travel plans with detailed itineraries |
| **Travel Requests** | Join existing travel plans and manage requests |
| **Location Management** | Explore and manage destination locations |
| **Reviews & Ratings** | Leave reviews after travel completion |
| **Payment Integration** | SSLCommerz gateway for subscription management |
| **Admin Dashboard** | Analytics, user management, payment monitoring |
| **User Dashboard** | Personal stats, travel history, bookings |
| **Interest Matching** | Connect users based on travel interests |
| **Cloud Storage** | Cloudinary integration for image management |

---

## 🛠 Tech Stack

### Backend Framework & Runtime
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe development

### Database & ODM
- **MongoDB** - NoSQL database
- **Mongoose** - Object Data Modeling (v8.16+)

### Authentication & Security
- **JWT (JSON Web Tokens)** - Token-based authentication
- **bcryptjs** - Password hashing
- **Cookie-Parser** - HTTP cookie handling

### Payment Gateway
- **SSLCommerz** - Payment processing
- **Axios** - HTTP client for gateway communication

### File Management
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage

### Validation & Error Handling
- **Zod** - TypeScript-first schema validation
- **HTTP Status Codes** - Standardized HTTP status management

### Development Tools
- **ESLint** - Code linting
- **TypeScript Compiler** - Type checking
- **ts-node-dev** - Development server with hot reload

### Deployment
- **Vercel** - Serverless deployment platform

---

## 🏗 Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENT APPLICATIONS                    │
│            (Web Frontend / Mobile App)                    │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST API
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    EXPRESS.JS LAYER                      │
│          ┌──────────────┐       ┌──────────────┐         │
│          │  Middleware  │       │  Error       │         │
│          │  - Auth      │       │  Handlers    │         │
│          │  - Validator │       │  - ZodError  │         │
│          │  - Parser    │       │  - AppError  │         │
│          └──────────────┘       └──────────────┘         │
└─────────────────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐
│   MODULE ROUTES      │  │   MODULE ROUTES      │
│   /auth, /user,      │  │   /payment, /review, │
│   /travel-requests   │  │   /stats, /interests │
└──────────┬───────────┘  └──────────┬───────────┘
           │                         │
        ┌──┴────────────────────────┴──┐
        ▼                              ▼
┌──────────────────────┐  ┌──────────────────────┐
│  CONTROLLERS         │  │  SERVICES            │
│  Handle HTTP Req/Res │  │  Business Logic      │
│  Input Validation    │  │  Data Processing     │
└──────────┬───────────┘  └──────────┬───────────┘
           │                         │
        ┌──┴────────────────────────┴──┐
        ▼                              ▼
┌──────────────────────────────────────────┐
│         MONGOOSE MODELS/INTERFACES       │
│  User, TravelPlan, Review, Payment, etc. │
└──────────┬───────────────────────────────┘
           │
        ┌──┴─────────────────────────────────┐
        ▼                                    ▼
┌──────────────────────┐      ┌──────────────────────┐
│     MONGODB          │      │   EXTERNAL SERVICES  │
│   Database Storage   │      │  - SSLCommerz        │
│                      │      │  - Cloudinary        │
└──────────────────────┘      └──────────────────────┘
```

---

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Tafhim301/We-Travel-Backend.git
   cd We-Travel-Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Configure all environment variables (see Environment Configuration section)
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   
   Server will start at: `http://localhost:5000`

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

---

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/we-travel

# JWT Configuration
JWT_ACCESS_SECRET=your_access_secret_key_here
JWT_ACCESS_EXPIRES=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRES=30d

# Bcrypt
BCRYPT_SALT_ROUND=12

# Admin Credentials
ADMIN_EMAIL=admin@wetravelapp.com
ADMIN_PASSWORD=AdminPassword123!

# Subscription Pricing (in cents)
MONTHLY_SUBSCRIPTION_PRICE=500
YEARLY_SUBSCRIPTION_PRICE=5000

# Frontend URL
FRONTEND_URL=http://localhost:3000

# SSLCommerz Payment Gateway
SSL_STORE_ID=your_ssl_store_id
SSL_STORE_PASS=your_ssl_store_password
SSL_PAYMENT_API=https://sandbox.sslcommerz.com/gwprocess/v4/api.php
SSL_VALIDATION_API=https://sandbox.sslcommerz.com/validator/api/validationAPI.php
SSL_SUCCESS_FRONTEND_URL=http://localhost:3000/payment/success
SSL_FAIL_FRONTEND_URL=http://localhost:3000/payment/fail
SSL_CANCEL_FRONTEND_URL=http://localhost:3000/payment/cancel
SSL_SUCCESS_BACKEND_URL=http://localhost:5000/api/payment/success
SSL_FAIL_BACKEND_URL=http://localhost:5000/api/payment/fail
SSL_CANCEL_BACKEND_URL=http://localhost:5000/api/payment/cancel
SSL_IPN_URL=http://localhost:5000/api/payment/ipn

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Documentation

### Core Concepts

#### User Roles
- **ADMIN** - Full system access, user management, analytics
- **HOST** - Can create travel plans, receive reviews, manage bookings
- **USER** - Can join plans, leave reviews, manage profile

#### Subscription Types
- **MONTHLY** - Monthly access ($5 USD)
- **YEARLY** - Annual access ($50 USD)

#### Travel Types
- Solo
- Group
- Family
- Adventure
- Cultural
- Beach

#### Payment Status Flow
```
PENDING → SUCCESS ✓ (User subscribed)
       ↘ FAILED ✗ (Invalid payment)
       ↘ CANCELLED ✗ (User cancelled)
```

---

## API Routes

### 📱 Authentication Module (`/api/auth`)

| Method | Endpoint | Description | Auth | Body |
|--------|----------|-------------|------|------|
| POST | `/login` | User login | ❌ | `{ email, password }` |
| POST | `/logout` | User logout | ✅ USER | - |

**Login Response:**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": { "id", "name", "email", "role" },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

---

### 👤 User Module (`/api/user`)

| Method | Endpoint | Description | Auth | Params |
|--------|----------|-------------|------|--------|
| POST | `/register` | Create new user | ❌ | FormData: name, email, password, profileImage |
| GET | `/all-users` | List all users | ✅ ADMIN | `page`, `limit`, `search` |
| GET | `/me` | Get current user profile | ✅ USER | - |
| PATCH | `/update` | Update user profile | ✅ USER | FormData: name, bio, interests, visitedCountries, profileImage |
| POST | `/validate-password` | Verify current password | ✅ USER | `{ password }` |

**User Object:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "profileImage": { "url": "image_url", "public_id": "cloudinary_id" },
  "bio": "Travel enthusiast",
  "interests": ["hiking", "photography"],
  "visitedCountries": ["Thailand", "Vietnam"],
  "currentLocation": "Bangkok",
  "averageRating": 4.5,
  "isActive": "active",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### 🏖️ Travel Plans Module (`/api/travelPlans`)

| Method | Endpoint | Description | Auth | Params |
|--------|----------|-------------|------|--------|
| POST | `/` | Create travel plan | ✅ HOST | FormData: title, description, destination, dates, budget, travelType |
| GET | `/` | List travel plans | ❌ | `page`, `limit`, `destination`, `travelType`, `search` |
| GET | `/:id` | Get plan details | ❌ | - |
| PATCH | `/:id` | Update travel plan | ✅ HOST | Same as create |
| DELETE | `/:id` | Delete travel plan | ✅ HOST | - |
| GET | `/:id/members` | Get plan members | ❌ | - |

**Travel Plan Object:**
```json
{
  "_id": "plan_id",
  "user": "host_user_id",
  "title": "Southeast Asia Adventure 2024",
  "description": "Explore Thailand, Vietnam & Cambodia",
  "image": "cover_image_url",
  "destination": "location_id",
  "startDate": "2024-06-01",
  "endDate": "2024-06-15",
  "budgetRange": { "min": 1500, "max": 3000 },
  "travelType": "adventure",
  "itinerary": "Detailed day-by-day plan...",
  "maxMembers": 10,
  "approvedMembers": ["user_id_1", "user_id_2"],
  "requestedBy": ["user_id_3"],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### 📝 Travel Requests Module (`/api/travel-requests`)

| Method | Endpoint | Description | Auth | Params |
|--------|----------|-------------|------|--------|
| POST | `/request/:planId` | Join a travel plan | ✅ USER | - |
| GET | `/` | List user's requests | ✅ USER | - |
| PATCH | `/:requestId/approve` | Approve join request | ✅ HOST | - |
| PATCH | `/:requestId/reject` | Reject join request | ✅ HOST | - |
| DELETE | `/:requestId` | Cancel request | ✅ USER | - |

---

### 📍 Location Module (`/api/location`)

| Method | Endpoint | Description | Auth | Params |
|--------|----------|-------------|------|--------|
| POST | `/` | Create location | ✅ ADMIN | `{ name, country, description, image }` |
| GET | `/` | List locations | ❌ | `page`, `limit`, `search` |
| GET | `/:id` | Get location details | ❌ | - |
| PATCH | `/:id` | Update location | ✅ ADMIN | Same as create |
| DELETE | `/:id` | Delete location | ✅ ADMIN | - |

---

### ⭐ Reviews Module (`/api/review`)

| Method | Endpoint | Description | Auth | Params |
|--------|----------|-------------|------|--------|
| POST | `/` | Leave review | ✅ USER | `{ rating, comment, travelPlanId }` |
| GET | `/host/:hostId` | Get host's reviews | ❌ | `page`, `limit` |
| GET | `/travel-plan/:planId` | Get plan reviews | ❌ | - |
| PATCH | `/:id` | Update review | ✅ USER | `{ rating, comment }` |
| DELETE | `/:id` | Delete review | ✅ USER | - |

**Review Object:**
```json
{
  "_id": "review_id",
  "travelPlan": "plan_id",
  "author": "user_id",
  "host": "host_id",
  "rating": 5,
  "comment": "Amazing experience!",
  "createdAt": "2024-01-15T00:00:00Z"
}
```

---

### 💳 Payment Module (`/api/payment`)

| Method | Endpoint | Description | Auth | Params |
|--------|----------|-------------|------|--------|
| POST | `/init-payment` | Initialize payment | ✅ USER | `{ subscriptionType }` (monthly/yearly) |
| POST | `/verify-payment` | Verify payment | ✅ USER | `{ transactionId }` |
| GET | `/history` | Get payment history | ✅ USER | `page`, `limit`, `status` |
| GET | `/:paymentId` | Get payment details | ✅ USER | - |
| POST | `/ipn` | IPN callback (SSLCommerz) | ❌ | SSLCommerz data |
| GET | `/subscription/status` | Check subscription | ✅ USER | - |

**Payment Response:**
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.sslcommerz.com/openapi/checkout/...",
  "transactionId": "unique_transaction_id"
}
```

**Payment Object:**
```json
{
  "_id": "payment_id",
  "user": "user_id",
  "amount": 500,
  "currency": "BDT",
  "transactionId": "TXN_123456789",
  "paymentStatus": "success",
  "subscriptionType": "monthly",
  "expiresAt": "2024-02-01T00:00:00Z",
  "paymentGatewayData": {
    "tran_id": "ssl_transaction_id",
    "status": "VALID",
    "bank_tran_id": "bank_transaction_id"
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### 📊 Stats & Analytics Module (`/api/stats`)

#### Admin Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/overview` | Business overview | ✅ ADMIN |
| GET | `/admin/users` | User statistics | ✅ ADMIN |
| GET | `/admin/bookings` | Booking analytics | ✅ ADMIN |
| GET | `/admin/payments` | Payment statistics | ✅ ADMIN |
| GET | `/admin/tours` | Tour analytics | ✅ ADMIN |

**Admin Overview Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalPremiumUsers": 45,
    "premiumPercentage": 30,
    "monthlySubscriptions": 28,
    "yearlySubscriptions": 17,
    "monthlyPercentage": 62.22,
    "yearlyPercentage": 37.78,
    "totalTours": 89,
    "totalPayments": 45,
    "successfulPayments": 42,
    "pendingPayments": 2,
    "failedPayments": 1,
    "totalRevenue": 28500,
    "bestReviewedHost": {
      "_id": "host_id",
      "name": "Host Name",
      "averageRating": 4.8,
      "reviewCount": 25
    },
    "topDestinations": [
      { "name": "Thailand", "tourCount": 15 },
      { "name": "Vietnam", "tourCount": 12 }
    ],
    "revenueBySubscription": {
      "monthly": 15000,
      "yearly": 13500
    }
  }
}
```

#### User Dashboard

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/me/overview` | Personal overview | ✅ USER |

**User Overview Response:**
```json
{
  "success": true,
  "data": {
    "totalToursCreated": 5,
    "totalToursJoined": 12,
    "totalReviewsReceived": 8,
    "averageRating": 4.6,
    "totalSpent": 1500,
    "subscriptionStatus": "active",
    "subscriptionType": "monthly",
    "expiresAt": "2024-02-01T00:00:00Z",
    "upcomingTours": 3,
    "pastTours": 9,
    "recommendations": []
  }
}
```

---

### 🎯 Interests Module (`/api/interests`)

| Method | Endpoint | Description | Auth | Params |
|--------|----------|-------------|------|--------|
| GET | `/` | List all interests | ❌ | - |
| POST | `/` | Create interest | ✅ ADMIN | `{ name, description }` |
| PATCH | `/:id` | Update interest | ✅ ADMIN | `{ name, description }` |
| DELETE | `/:id` | Delete interest | ✅ ADMIN | - |

---

## 🗄️ Database Schema

### User Collection
```
User {
  _id: ObjectId
  name: String
  email: String (unique)
  password: String (hashed)
  role: Enum(admin, host, user)
  profileImage: { url, public_id }
  bio: String
  interests: String[]
  visitedCountries: String[]
  currentLocation: String
  averageRating: Number (0-5)
  isActive: Enum(active, blocked)
  plans: ObjectId[] (ref: TravelPlan)
  reviewsReceived: ObjectId[] (ref: Review)
  reviewsWritten: ObjectId[] (ref: Review)
  createdAt: Date
  updatedAt: Date
}
```

### Travel Plan Collection
```
TravelPlan {
  _id: ObjectId
  user: ObjectId (ref: User)
  title: String
  description: String
  image: String
  demoImages: String[]
  destination: ObjectId (ref: Location)
  startDate: Date
  endDate: Date
  budgetRange: { min, max }
  travelType: Enum(solo, group, family, adventure, cultural, beach)
  itinerary: String
  maxMembers: Number
  visibility: Boolean
  approvedMembers: ObjectId[] (ref: User)
  requestedBy: ObjectId[] (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

### Payment Collection
```
Payment {
  _id: ObjectId
  user: ObjectId (ref: User)
  amount: Number
  currency: String
  transactionId: String (unique)
  paymentStatus: Enum(pending, success, failed, cancelled)
  subscriptionType: Enum(monthly, yearly)
  expiresAt: Date
  paymentGatewayData: {
    tran_id: String
    status: String
    val_id: String
    bank_tran_id: String
    card_type: String
  }
  createdAt: Date
  updatedAt: Date
}
```

### Review Collection
```
Review {
  _id: ObjectId
  travelPlan: ObjectId (ref: TravelPlan)
  author: ObjectId (ref: User)
  host: ObjectId (ref: User)
  rating: Number (1-5)
  comment: String
  createdAt: Date
  updatedAt: Date
}
```

---

## 📁 Project Structure

```
We-Travel-Backend/
├── src/
│   ├── app/
│   │   ├── config/               # Configuration files
│   │   │   ├── cloudinary.config.ts
│   │   │   ├── env.ts
│   │   │   └── multer.config.ts
│   │   ├── errorHandlers/        # Error handling utilities
│   │   │   ├── appError.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   ├── handleCastError.ts
│   │   │   ├── handleDuplicateError.ts
│   │   │   ├── handleValidationError.ts
│   │   │   └── handleZodError.ts
│   │   ├── interfaces/           # TypeScript interfaces
│   │   │   ├── error.types.ts
│   │   │   └── index.d.ts
│   │   ├── middlewares/          # Express middlewares
│   │   │   ├── checkAuth.ts
│   │   │   ├── formDataParser.ts
│   │   │   ├── notFound.ts
│   │   │   └── validateRequest.ts
│   │   ├── modules/              # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.routes.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── user/
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.interface.ts
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── user.validation.ts
│   │   │   │   └── user.constant.ts
│   │   │   ├── travelPlan/
│   │   │   │   ├── travelPlan.controller.ts
│   │   │   │   ├── travelPlan.interface.ts
│   │   │   │   ├── travelPlan.model.ts
│   │   │   │   ├── travelPlan.routes.ts
│   │   │   │   ├── travelPlan.service.ts
│   │   │   │   └── travelPlan.validation.ts
│   │   │   ├── travelRequest/
│   │   │   │   ├── travelRequest.controller.ts
│   │   │   │   ├── travelRequest.interface.ts
│   │   │   │   ├── travelRequest.model.ts
│   │   │   │   ├── travelRequest.routes.ts
│   │   │   │   └── travelRequest.service.ts
│   │   │   ├── review/
│   │   │   │   ├── review.controller.ts
│   │   │   │   ├── review.interface.ts
│   │   │   │   ├── review.model.ts
│   │   │   │   ├── review.routes.ts
│   │   │   │   └── review.service.ts
│   │   │   ├── location/
│   │   │   │   ├── location.controller.ts
│   │   │   │   ├── location.interface.ts
│   │   │   │   ├── location.model.ts
│   │   │   │   ├── location.routes.ts
│   │   │   │   ├── location.service.ts
│   │   │   │   └── location.validation.ts
│   │   │   ├── payment/
│   │   │   │   ├── payment.controller.ts
│   │   │   │   ├── payment.interface.ts
│   │   │   │   ├── payment.model.ts
│   │   │   │   ├── payment.routes.ts
│   │   │   │   └── payment.service.ts
│   │   │   ├── stats/
│   │   │   │   ├── stats.controller.ts
│   │   │   │   ├── stats.routes.ts
│   │   │   │   └── stats.service.ts
│   │   │   └── interests/
│   │   │       ├── interest.validation.ts
│   │   │       ├── interests.interface.ts
│   │   │       ├── interests.model.ts
│   │   │       ├── interests.routes.ts
│   │   │       ├── interests.service.ts
│   │   │       └── interests.controller.ts
│   │   ├── routes/
│   │   │   └── index.ts          # Main router combining all modules
│   │   ├── utils/                # Utility functions
│   │   │   ├── catchAsync.ts     # Async error wrapper
│   │   │   ├── cloudinaryDelete.ts
│   │   │   ├── cloudinaryExtractUrl.ts
│   │   │   ├── cloudinaryUploader.ts
│   │   │   ├── jwt.ts
│   │   │   ├── queryBuilder.ts
│   │   │   ├── seedAdmin.ts
│   │   │   ├── sendResponse.ts
│   │   │   ├── setCookies.ts
│   │   │   ├── userTokens.ts
│   │   │   └── validatePasswordandSetCookie.ts
│   │   ├── app.ts               # Express app setup
│   │   └── globalConstants.ts   # Global constants
│   ├── server.ts                # Server entry point
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── .gitignore
├── eslint.config.mjs            # ESLint configuration
├── package.json
├── package-lock.json
├── tsconfig.json                # TypeScript configuration
├── vercel.json                  # Vercel deployment config
└── README.md                    # This file
```

---

## API Response Format

All API responses follow a standardized format:

### Success Response (2xx)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "statusCode": 400,
    "details": "Detailed error information"
  }
}
```

---

## Error Handling

The API implements comprehensive error handling:

| Error Type | HTTP Code | Description |
|------------|-----------|-------------|
| **ValidationError** | 400 | Input validation failed |
| **AuthenticationError** | 401 | User not authenticated |
| **AuthorizationError** | 403 | Insufficient permissions |
| **NotFoundError** | 404 | Resource not found |
| **ConflictError** | 409 | Resource already exists |
| **ServerError** | 500 | Internal server error |

---

## Running Tests

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint -- --fix

# Build TypeScript
npm run build

# Run tests (when available)
npm test
```

---

## Deployment

### Deploy to Vercel

1. **Connect GitHub repository:**
   ```bash
   vercel --prod
   ```

2. **Set environment variables in Vercel dashboard:**
   - Add all variables from `.env.example`

3. **Deployment:**
   - Automatic deployment on push to `main` branch

### Vercel Configuration

The project includes `vercel.json` for serverless deployment:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

---

## Production Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] SSL certificates configured
- [ ] SSLCommerz production credentials obtained
- [ ] Cloudinary account configured
- [ ] CORS and security headers enabled
- [ ] Rate limiting implemented
- [ ] Logging and monitoring setup
- [ ] Error tracking (Sentry, etc.) configured
- [ ] Database indexes optimized

---

## Key Middleware & Utilities

### Authentication Middleware
```typescript
checkAuth(...roles: Role[]): Middleware
// Protects routes, validates JWT, checks user roles
```

### Async Error Wrapper
```typescript
catchAsync(fn: Function): Middleware
// Wraps async controller functions to catch errors
```

### Response Formatter
```typescript
sendResponse<T>(res: Response, data: ResponseData<T>): void
// Standardized response formatting across API
```

### Query Builder
```typescript
new QueryBuilder(query, filters)
  .search(['field1', 'field2'])
  .filter()
  .sort()
  .paginate()
  .getQuery()
```

---

## Contributing

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/We-Travel-Backend.git
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Follow code standards:**
   - Use TypeScript
   - Follow existing naming conventions
   - Run ESLint: `npm run lint`
   - Comment complex logic

4. **Commit with descriptive messages**
   ```bash
   git commit -m "Add: Amazing feature description"
   ```

5. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

---

## Performance Optimization

### Database Optimization
- ✅ Indexed frequently queried fields
- ✅ MongoDB aggregation pipelines for complex queries
- ✅ Connection pooling with Mongoose
- ✅ Lean queries where projections needed

### API Optimization
- ✅ Pagination for large datasets
- ✅ Field filtering/projections
- ✅ Response compression
- ✅ Caching headers

### Code Optimization
- ✅ Async/await for non-blocking I/O
- ✅ MongoDB transactions for data consistency
- ✅ Efficient error handling

---

## Security Features

- ✅ **JWT Authentication** - Token-based auth with expiry
- ✅ **Password Hashing** - bcryptjs with salt rounds
- ✅ **Role-Based Access Control** - Admin, Host, User roles
- ✅ **Input Validation** - Zod schema validation
- ✅ **CORS Protection** - Cross-origin resource sharing
- ✅ **Error Masking** - Sensitive info not exposed
- ✅ **Environment Variables** - Credentials in .env
- ✅ **Secure Cookies** - HTTP-only cookie flags
- ✅ **Payment Validation** - SSLCommerz signature verification

---

## Troubleshooting

### Server won't start
```bash
# Check port availability
netstat -ano | findstr :5000

# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install --legacy-peer-deps
```

### Database connection error
- Verify MongoDB URI in `.env`
- Check MongoDB service is running
- Ensure network access in MongoDB Atlas

### Payment integration issues
- Verify SSLCommerz credentials
- Check callback URLs in `.env`
- Review SSLCommerz documentation

---

## Resources & Documentation

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Authentication](https://jwt.io/)
- [SSLCommerz Integration](https://developer.sslcommerz.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 💳 Payment Integration (SSLCommerz)

### Overview
The We-Travel platform integrates with **SSLCommerz**, Bangladesh's leading payment gateway, enabling secure subscription payments with real-time status updates.

### Payment Flow

```
User Initiates Payment
    ↓
Generate Transaction ID & Payment Record (PENDING)
    ↓
Call SSLCommerz Gateway API
    ↓
Redirect User to SSLCommerz Payment Page
    ↓
User Completes/Cancels Payment
    ↓
SSLCommerz Callbacks (IPN + Redirect)
    ↓
Update Payment Status
    ↓
Update User Subscription (Atomic Transaction)
    ↓
Redirect User to Success/Fail/Cancel Page
```

### Key Functions

**1. Initialize Payment**
```typescript
POST /api/payments/init
Authorization: Bearer {JWT}
Content-Type: application/json

Request:
{
  "subscriptionType": "monthly" | "yearly"
}

Response:
{
  "paymentUrl": "https://securepay.sslcommerz.com/...",
  "transactionId": "TXN-1733212345678-abc123d"
}
```

**2. Handle Success Callback**
- Called when user completes payment on SSLCommerz
- Updates payment status to SUCCESS
- Activates user subscription (atomic transaction)
- Calculates expiry date based on subscription type

**3. IPN (Instant Payment Notification)**
```
SSLCommerz POST → /api/payments/ipn
Real-time payment status update
Processes immediately without user action
```

**4. Verify Payment Status**
```typescript
GET /api/payments/subscription/details
Authorization: Bearer {JWT}

Response:
{
  "hasActiveSubscription": true,
  "subscriptionType": "monthly",
  "expiresAt": "2025-01-03T12:00:00Z",
  "daysRemaining": 31
}
```

### Payment Status State Machine
```
┌─────────┐
│ PENDING │
└────┬────┘
     │
     ├─→ SUCCESS (Payment verified)
     │      ↓
     │   User Subscription Activated
     │   expiresAt = current_date + duration
     │
     ├─→ FAILED (Payment rejected by bank)
     │
     └─→ CANCELLED (User cancelled payment)
```

### Security Features

✅ **Atomic Transactions** - Payment status + user subscription update together
✅ **Idempotent Operations** - Safe to retry failed operations
✅ **Amount Verification** - Validates payment amount matches database
✅ **Transaction ID Verification** - Ensures transaction matches SSLCommerz report
✅ **User Isolation** - Users access only own payment history
✅ **Protected Routes** - Payment endpoints require JWT authentication

### Environment Configuration

```env
# SSLCommerz Credentials
SSL_STORE_ID=your_store_id
SSL_STORE_PASS=your_store_password
SSL_PAYMENT_API=https://securepay.sslcommerz.com/gwprocess/v4/api.php
SSL_VALIDATION_API=https://securepay.sslcommerz.com/validator/api/validationAPI.php

# Callback URLs (what SSLCommerz calls)
SSL_SUCCESS_BACKEND_URL=https://api.yourdomain.com/api/payments/success
SSL_FAIL_BACKEND_URL=https://api.yourdomain.com/api/payments/fail
SSL_CANCEL_BACKEND_URL=https://api.yourdomain.com/api/payments/cancel
SSL_IPN_URL=https://api.yourdomain.com/api/payments/ipn

# Frontend Redirect URLs (where user goes)
SSL_SUCCESS_FRONTEND_URL=https://yourdomain.com/payment/success
SSL_FAIL_FRONTEND_URL=https://yourdomain.com/payment/failed
SSL_CANCEL_FRONTEND_URL=https://yourdomain.com/payment/cancelled

# Subscription Prices (BDT)
MONTHLY_SUBSCRIPTION_PRICE=299
YEARLY_SUBSCRIPTION_PRICE=2999
```

### Testing Checklist

- [ ] Payment initialization returns valid gateway URL
- [ ] User redirected to SSLCommerz payment page
- [ ] Payment completion updates status to SUCCESS
- [ ] User subscription activated after payment
- [ ] Subscription details show correct expiry date
- [ ] Payment history displays transaction
- [ ] Multiple payments work correctly
- [ ] Cancellation updates status to CANCELLED
- [ ] Failed payments update status to FAILED
- [ ] IPN callback processes in real-time

### Production Checklist

- [ ] All environment variables configured
- [ ] SSL certificates enabled (HTTPS required)
- [ ] SSLCommerz production credentials obtained
- [ ] Callback URLs accessible from internet
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] Rate limiting implemented
- [ ] Monitoring and alerts setup

---

## 📊 Admin & User Dashboards

### Admin Dashboard Endpoints

**1. Comprehensive Overview**
```
GET /api/stats/admin/overview
```

Returns all key business metrics including:
- Total/Active/Premium users with percentages
- Monthly vs Yearly subscription breakdown
- Total/Successful/Pending/Failed/Cancelled payments
- Total revenue
- Best reviewed host
- Top destinations

**2. User Analytics**
```
GET /api/stats/admin/users
Query Params: page, limit, search
```

User statistics with pagination including:
- User breakdown by status (active/inactive/blocked)
- User breakdown by role (admin/host/user)
- Premium user percentage

**3. Payment Analytics**
```
GET /api/stats/admin/payments
Query Params: startDate, endDate, page, limit
```

Payment and revenue metrics:
- Total payments and revenue
- Status breakdown (with percentages)
- Subscription type breakdown
- Revenue by subscription type

**4. Travel Plan Analytics**
```
GET /api/stats/admin/tours
Query Params: page, limit
```

Travel planning metrics:
- Total travel plans created
- Plans by travel type distribution
- Plans with requests/approved members/reviews
- Average members per plan

**5. Travel Request Analytics**
```
GET /api/stats/admin/bookings
Query Params: page, limit
```

Travel request statistics:
- Total requests
- Status breakdown (pending/accepted/rejected)

**6. Top Reviewed Hosts**
```
GET /api/stats/admin/top-hosts
Query Params: limit (default: 10, max: 50)
```

Rankings and leaderboard data for best hosts

**7. Top Destinations**
```
GET /api/stats/admin/top-destinations
Query Params: limit (default: 10, max: 50)
```

Most popular travel destinations with:
- Total plans per destination
- Average budget ranges

### User Dashboard Endpoints

**1. Personal Dashboard**
```
GET /api/stats/me/overview
Authorization: Bearer {JWT}
```

User-specific metrics:
- Total tours created
- Total tours joined
- Reviews received
- Average rating
- Subscription status and expiry
- Days remaining in subscription

### Key Metrics for Visualizations

**Pie Charts:**
- Subscription types (Monthly vs Yearly)
- Payment status breakdown
- User status distribution
- Rating distribution (1-5 stars)
- Travel types breakdown

**Line/Bar Charts:**
- User growth trends
- Revenue trends over time
- Top destinations
- Travel requests by status
- Payment success rates

**Tables:**
- Top reviewed hosts with ratings
- Top destinations with budget ranges
- Recent payments
- User activity log

**KPI Cards:**
- Total users & active percentage
- Total revenue & growth
- Premium users count
- Average platform rating
- Subscription counts

### Dashboard Layout Strategy

**Admin Dashboard:**
1. Header KPIs (4 cards): Total users, Revenue, Premium count, Avg rating
2. Overview charts (4 pie charts): User status, Payment status, Subscriptions, Ratings
3. Business trends (2 line charts): User growth, Revenue trend
4. Planning metrics (4 cards): Total plans, Plans by type, Requests, Members
5. Top performers (2 tables): Best hosts, Top destinations

**User Dashboard:**
1. Profile header: Picture, name, rating, reviews
2. Activity overview: Tours created, Tours joined, Reviews
3. Subscription info: Type, expiry, days remaining
4. Recent transactions: Last 10 payments with status

---

## 🗄️ Stats Service Implementation

### Database Aggregation Pipelines

The stats service uses MongoDB aggregation pipelines for:
- Complex grouping operations
- Multiple stage transformations
- Performance optimization with early `$match` filtering
- `$lookup` for relationship data joining
- Efficient sorting and limiting at aggregation level

### Performance Optimization Strategies

1. **Early Filtering** - Date and status filters applied at `$match` stage
2. **Projection** - Only required fields projected to reduce data transfer
3. **Sorting** - Efficient sorting at aggregation level
4. **Limiting** - Results capped early to minimize processing
5. **Indexes** - Database indexes on commonly filtered fields

### Example Aggregation Pipeline

```typescript
// Get top 10 destinations by travel plan count
db.travelplans.aggregate([
  { $group: { 
      _id: "$destination",
      count: { $sum: 1 },
      avgBudgetMin: { $avg: "$budgetRange.min" }
    }
  },
  { $sort: { count: -1 } },
  { $limit: 10 },
  { $lookup: {
      from: "locations",
      localField: "_id",
      foreignField: "_id",
      as: "destinationData"
    }
  }
])
```

### Key Stats Service Functions

| Function | Description |
|----------|-------------|
| `getUserStats()` | User count by status/role |
| `getPaymentStats()` | Payment metrics and revenue |
| `getTourStats()` | Travel plan analytics |
| `getReviewStats()` | Rating distribution |
| `getTopHosts()` | Best reviewed hosts ranking |
| `getTopDestinations()` | Most popular locations |
| `getUserGrowth()` | New user trends |

---

## Advanced Features

### Real-Time Status Updates

The IPN (Instant Payment Notification) handler ensures:
- Immediate payment status updates without user interaction
- User subscription activated as soon as payment succeeds
- Automatic expiry date calculation
- Failed payment tracking for support

### Atomic Transactions

```typescript
// Payment verification + user subscription update in single transaction
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Update payment status
  await Payment.updateOne({ _id: paymentId }, { paymentStatus: 'success' }, { session });
  
  // 2. Update user subscription
  await User.updateOne({ _id: userId }, { subscription: {...} }, { session });
  
  // Both succeed or both rollback
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

### Idempotent Operations

Payment verification is idempotent:
- Same payment can be verified multiple times safely
- Returns existing payment without duplicate processing
- No side effects from retry attempts

### Data Consistency

- Payment status follows strict state machine (PENDING → SUCCESS/FAILED/CANCELLED)
- User subscription only activated after successful payment verification
- Payment records immutable after creation (only status updates)
- Transaction IDs globally unique with database index

---

## 🧪 Testing Guide

### Unit Tests

```bash
# Test transaction ID generation
npm test -- payment.service.test.ts

# Test expiry date calculations
npm test -- payment.utils.test.ts

# Test subscription status checks
npm test -- payment.service.subscription.test.ts
```

### Integration Tests

```bash
# Test full payment flow with mock SSLCommerz
npm test -- payment.integration.test.ts

# Test atomic transaction rollback
npm test -- payment.transaction.test.ts
```

### Edge Cases

- Duplicate payment verification attempt → Returns existing payment
- Subscription renewal with active subscription → Creates new payment record
- SSLCommerz API timeout → Graceful error handling, payment remains PENDING
- Invalid validation response → Rejects payment with detailed error

### Sandbox Testing

1. Get SSLCommerz test credentials
2. Set `SSL_STORE_ID` and `SSL_STORE_PASS` to test values
3. Initialize payment in development environment
4. Complete payment on SSLCommerz test gateway
5. Verify payment status updated in database

---

## 🔍 Troubleshooting

### Payment Stuck in PENDING

**Causes:**
- IPN endpoint not configured in SSLCommerz merchant panel
- Callback URL unreachable from SSLCommerz
- Database transaction failed silently

**Solution:**
- Verify IPN URL in SSLCommerz settings
- Test with: `curl -X POST http://localhost:5000/api/payments/ipn`
- Check database transaction logs
- Use `/api/payments/verify` for manual verification

### Subscription Not Activated

**Causes:**
- Payment status never updated to SUCCESS
- User record not found in database
- Atomic transaction rolled back

**Solution:**
- Check `db.payments.findOne({ transactionId: "..." })` for status
- Verify user exists with correct ID
- Review server logs for transaction errors

### Duplicate Payments

**Causes:**
- Frontend allows multiple rapid clicks
- No check for active subscription before new payment

**Solution:**
- Disable submit button during payment (frontend)
- Backend checks for active subscription (already implemented)
- Rate limit payment initialization endpoint

---

## 📈 Analytics & Insights

### Key Business Metrics

| Metric | Purpose | Insights |
|--------|---------|----------|
| Premium Conversion Rate | % users upgrading | Marketing effectiveness |
| Monthly vs Yearly Ratio | Subscription preference | Revenue forecasting |
| Payment Success Rate | Payment reliability | Gateway health |
| Churn Rate | Subscription cancellations | User satisfaction |
| Average Revenue per User | ARPU | Business growth |
| Top Destinations | Popular locations | Content focus |
| Best Reviewed Hosts | Quality indicators | Community trust |

### Monitoring Recommendations

- Set alerts for payment failures > 5% of total
- Monitor average rating trends (drop indicates issues)
- Track new user registration trends
- Monitor API response times (should be < 500ms)
- Set alerts for database transaction failures

---

## 🚀 Deployment & DevOps

### Pre-Production Checklist

- [ ] TypeScript compilation: `npm run build` ✓
- [ ] ESLint checks: `npm run lint` ✓
- [ ] Environment variables configured
- [ ] MongoDB indexes created
- [ ] HTTPS certificates installed
- [ ] SSLCommerz credentials updated to production
- [ ] Callback URLs publicly accessible
- [ ] Rate limiting enabled
- [ ] Logging service configured
- [ ] Database backup strategy implemented
- [ ] Monitoring and alerting setup
- [ ] Load testing completed

### Vercel Deployment

```bash
# Build and deploy
npm run build
vercel --prod

# Set environment variables in Vercel dashboard
# Deployment automatic on main branch push
```

### Scaling Considerations

- **Database**: Ensure MongoDB indexes on all filtered/sorted fields
- **Caching**: Redis for frequently accessed user subscription status
- **Background Jobs**: Queue long-running stats aggregations
- **API Rate Limiting**: Prevent abuse of payment/stats endpoints
- **CDN**: Static assets and images via CDN
- **Load Balancer**: Multiple API instances behind load balancer

---

## 🔐 Security Best Practices

### Implemented ✅
- JWT token-based authentication with expiry
- bcryptjs password hashing (12 salt rounds)
- Role-based access control (RBAC)
- Input validation with Zod schemas
- CORS protection with environment-based whitelist
- Secure cookie flags (HTTPOnly, SameSite)
- Environment variable protection (never in code)
- Atomic transactions prevent partial updates
- User data isolation (can only access own data)

### Recommendations 🔒
- Add HMAC signature verification for IPN callbacks
- Implement IP whitelisting for SSLCommerz IPN
- Add rate limiting to payment endpoints
- Enable request logging and monitoring
- Regular security audits and penetration testing
- Keep dependencies updated regularly
- Implement DDOS protection (Cloudflare)
- Regular database backups to secure storage
- Secrets rotation policy (quarterly)

---

## Changelog

### Version 1.0.0 (December 2024)
- ✨ Initial release
- 🎯 Complete travel planning module
- 💳 SSLCommerz payment integration with real-time IPN
- ⭐ Review and rating system
- 📊 Comprehensive admin and user dashboard analytics
- 🔐 Secure authentication with JWT
- 🗄️ MongoDB aggregation pipelines for analytics
- 🔄 Atomic transactions for data consistency
- 📱 RESTful API with 30+ endpoints

---

## License

This project is licensed under the ISC License - see LICENSE file for details.

---

## Support & Contact

- 📧 **Email:** support@wetravelapp.com
- 🐛 **Issues:** [GitHub Issues](https://github.com/Tafhim301/We-Travel-Backend/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/Tafhim301/We-Travel-Backend/discussions)
- 📚 **Documentation:** Check this README for comprehensive guides

---

## Acknowledgments

- Built with ❤️ using Node.js and MongoDB
- Payment processing by SSLCommerz
- Image hosting by Cloudinary
- Deployed on Vercel
- Analytics powered by MongoDB aggregation pipelines

---

<div align="center">

**Made with ❤️ by the We-Travel Team**

⭐ If you find this helpful, please star the repository!

[Back to Top](#-we-travel-backend-api)

</div>
