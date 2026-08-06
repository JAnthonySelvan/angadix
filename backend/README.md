# Angadix - Phase 1 Backend Architecture

Production-grade, scalable, and secure RESTful backend API for **Angadix**, a premium e-commerce platform.

---

## 🌟 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas + Mongoose ODM (Strict Schema Mode)
- **Authentication**: JWT (Short-lived Access Token + Long-lived Refresh Token strategy)
- **Security**: `bcryptjs` (Cost factor 12), `helmet`, `cors`, `cookie-parser`, `express-rate-limit`, `express-mongo-sanitize`
- **Validation**: `express-validator` (422 Unprocessable Entity with field-level details)
- **Transactional Emails**: `nodemailer` with Angadix branded HTML templates (`#0266C8` primary, `#E1F5FE` accent) and local dev console fallback
- **Logging**: `morgan` + custom error stack logger

---

## 📁 Directory Structure

```
backend/
├── src/
│   ├── config/          # Environment & database connection manager
│   │   ├── db.js
│   │   ├── env.js
│   │   └── cloudinary.js (Phase 2 placeholder)
│   ├── models/          # Mongoose domain models (User.js)
│   ├── controllers/     # Business logic & request handling (auth.controller.js, user.controller.js)
│   ├── routes/          # Express route definitions (auth.routes.js, user.routes.js)
│   ├── middlewares/     # Auth, role authorization, validation, error & 404 middlewares
│   ├── services/        # Email & JWT token service layers
│   ├── utils/           # ApiError, ApiResponse, asyncHandler, token cookie generators
│   ├── validators/      # express-validator schemas
│   └── app.js           # Express app configuration & middleware mounts
├── server.js            # Server entrypoint with graceful shutdown & global error handling
├── api-tests.http       # REST Client test file for all endpoints
├── .env.example         # Environment template
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local MongoDB or MongoDB Atlas cluster connection string)

### 2. Environment Setup
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your settings:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

MONGO_URI=mongodb://127.0.0.1:27017/angadix

JWT_ACCESS_SECRET=your_super_secret_access_token_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="Angadix Premium Store <noreply@angadix.com>"
```

### 3. Installation & Boot

```bash
# Install dependencies
npm install

# Start in development mode (with nodemon)
npm run dev

# Start in production mode
npm start
```

---

## 🔐 Security Architecture

1. **Password Security**: Passwords are salted and hashed with `bcryptjs` using cost factor 12. Password field is flagged with `select: false` on Mongoose schema.
2. **Dual-Token Strategy**:
   - **Access Token**: Short-lived (~15 mins) JWT signed with `JWT_ACCESS_SECRET`.
   - **Refresh Token**: Long-lived (~7 days) JWT signed with `JWT_REFRESH_SECRET`, stored hashed/persistently on User document in DB for explicit revocation & session management.
   - Both tokens are delivered via `httpOnly`, `sameSite`, `secure` cookies while returning `accessToken` in payload for client flexibility.
3. **NoSQL Injection Shield**: Inputs sanitized with `express-mongo-sanitize` stripping dangerous `$` and `.` selectors.
4. **Rate Limiting**: Critical authentication endpoints (`/register`, `/login`, `/forgot-password`) rate limited via `express-rate-limit` (15 requests / 15 mins).
5. **Anti Email Enumeration**: `forgot-password` endpoint returns identical generic 200 responses regardless of whether the email exists.

---

## 📡 API Reference Documentation

### Global Response Conventions

#### Success Response (200, 201)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation description",
  "data": { ... }
}
```

#### Error Response (400, 401, 403, 404, 409, 422, 500)
```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed for one or more fields.",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address",
      "value": "invalid-email"
    }
  ]
}
```

---

### Authentication Endpoints (`/api/v1/auth`)

#### 1. Register User
- **Method**: `POST`
- **Path**: `/api/v1/auth/register`
- **Auth Required**: No (Rate Limited)
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "Password123!"
}
```
- **Response Shape (201 Created)**:
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "_id": "66b1a2c...",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "user",
      "isEmailVerified": false,
      "avatar": "",
      "createdAt": "2026-08-06T00:00:00.000Z",
      "updatedAt": "2026-08-06T00:00:00.000Z"
    }
  }
}
```

#### 2. Login User
- **Method**: `POST`
- **Path**: `/api/v1/auth/login`
- **Auth Required**: No (Rate Limited)
- **Request Body**:
```json
{
  "email": "jane.doe@example.com",
  "password": "Password123!"
}
```
- **Response Shape (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "user": {
      "_id": "66b1a2c...",
      "name": "Jane Doe",
      "email": "jane.doe@example.com",
      "role": "user",
      "isEmailVerified": true
    },
    "accessToken": "eyJhbGciOi..."
  }
}
```

#### 3. Logout User
- **Method**: `POST`
- **Path**: `/api/v1/auth/logout`
- **Auth Required**: Optional (Clears cookies and DB session)
- **Response Shape (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully.",
  "data": null
}
```

#### 4. Get Current User Profile (`/me`)
- **Method**: `GET`
- **Path**: `/api/v1/auth/me`
- **Auth Required**: Yes (`Bearer <token>` or `accessToken` cookie)
- **Response Shape (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Current user profile fetched successfully.",
  "data": {
    "_id": "66b1a2c...",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "user",
    "isEmailVerified": true,
    "avatar": ""
  }
}
```

#### 5. Refresh Access Token
- **Method**: `POST`
- **Path**: `/api/v1/auth/refresh-token`
- **Auth Required**: No (`refreshToken` in cookie or body)
- **Response Shape (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOi..."
  }
}
```

#### 6. Verify Email Address
- **Method**: `GET`
- **Path**: `/api/v1/auth/verify-email/:token`
- **Auth Required**: No
- **Response Shape (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully. You can now log in to your Angadix account.",
  "data": null
}
```

#### 7. Forgot Password
- **Method**: `POST`
- **Path**: `/api/v1/auth/forgot-password`
- **Auth Required**: No (Rate Limited)
- **Request Body**:
```json
{
  "email": "jane.doe@example.com"
}
```
- **Response Shape (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "If an account with that email address exists, password reset instructions have been sent.",
  "data": null
}
```

#### 8. Reset Password
- **Method**: `POST`
- **Path**: `/api/v1/auth/reset-password/:token`
- **Auth Required**: No
- **Request Body**:
```json
{
  "password": "NewSecurePassword123!"
}
```
- **Response Shape (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successful. Please log in with your new password.",
  "data": null
}
```

#### 9. Google OAuth 2.0 Login / Find-or-Create
- **Method**: `POST`
- **Path**: `/api/v1/auth/google`
- **Auth Required**: No (Rate Limited)
- **Request Body**:
```json
{
  "idToken": "eyJhbGciOiJSUzI1Ni..."
}
```
- **Response Shape (200 OK)**:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Google authentication successful.",
  "data": {
    "user": {
      "_id": "66b1a2c...",
      "name": "Jane Doe",
      "email": "jane.doe@gmail.com",
      "role": "user",
      "isEmailVerified": true,
      "authProvider": "google",
      "avatar": "https://lh3.googleusercontent.com/..."
    },
    "accessToken": "eyJhbGciOi..."
  }
}
```

---

### 🔑 Google Cloud Console OAuth Setup Guide

To configure Google OAuth 2.0 credentials for Angadix:

1. **Create Project**: Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project named `Angadix`.
2. **Configure OAuth Consent Screen**:
   - Navigation Menu -> **APIs & Services** -> **OAuth consent screen**.
   - User Type: Select **External**, then click **Create**.
   - App Information: Enter App name (`Angadix`), User support email, and Developer contact information.
   - Scopes: Add `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`.
   - Test Users: Add your test Gmail account address for local testing.
3. **Create Credentials**:
   - Navigation Menu -> **APIs & Services** -> **Credentials**.
   - Click **+ Create Credentials** -> **OAuth client ID**.
   - Application type: Select **Web application**.
   - Name: `Angadix Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (Vite Frontend local dev)
     - `http://localhost:5173`
   - **Authorized redirect URIs**:
     - `http://localhost:3000`
     - `http://localhost:5000/api/v1/auth/google/callback`
4. **Copy Environment Variables**:
   - Copy **Client ID** -> set `GOOGLE_CLIENT_ID` in `.env` (backend) and `VITE_GOOGLE_CLIENT_ID` in `.env` (frontend).
   - Copy **Client Secret** -> set `GOOGLE_CLIENT_SECRET` in `.env` (backend).

---


### User Endpoints (`/api/v1/users`)

#### 1. Get Profile
- **Method**: `GET`
- **Path**: `/api/v1/users/profile`
- **Auth Required**: Yes

#### 2. Update Profile
- **Method**: `PATCH`
- **Path**: `/api/v1/users/profile`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "name": "Jane Doe Updated",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### 3. Change Password
- **Method**: `PATCH`
- **Path**: `/api/v1/users/change-password`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

#### 4. Admin: Get All Users
- **Method**: `GET`
- **Path**: `/api/v1/users?page=1&limit=10`
- **Auth Required**: Yes (Role: `admin`)

---

### Category Endpoints (`/api/v1/categories`)

#### 1. Get All Categories
- **Method**: `GET`
- **Path**: `/api/v1/categories?isActive=true`
- **Auth Required**: No

#### 2. Get Category by Slug
- **Method**: `GET`
- **Path**: `/api/v1/categories/:slug`
- **Auth Required**: No

#### 3. Create Category
- **Method**: `POST`
- **Path**: `/api/v1/categories`
- **Auth Required**: Yes (Role: `admin`)
- **Content-Type**: `multipart/form-data` or `application/json`
- **Request Body**: `name` (required), `description` (optional), `parentCategory` (optional ObjectId), `image` (file, optional)

#### 4. Update Category
- **Method**: `PATCH`
- **Path**: `/api/v1/categories/:id`
- **Auth Required**: Yes (Role: `admin`)

#### 5. Delete Category (Soft-delete)
- **Method**: `DELETE`
- **Path**: `/api/v1/categories/:id`
- **Auth Required**: Yes (Role: `admin`)

---

### Brand Endpoints (`/api/v1/brands`)

#### 1. Get All Brands
- **Method**: `GET`
- **Path**: `/api/v1/brands?isActive=true`
- **Auth Required**: No

#### 2. Get Brand by Slug
- **Method**: `GET`
- **Path**: `/api/v1/brands/:slug`
- **Auth Required**: No

#### 3. Create Brand
- **Method**: `POST`
- **Path**: `/api/v1/brands`
- **Auth Required**: Yes (Role: `admin`)
- **Request Body**: `name` (required), `description` (optional), `logo` (file, optional)

#### 4. Update Brand
- **Method**: `PATCH`
- **Path**: `/api/v1/brands/:id`
- **Auth Required**: Yes (Role: `admin`)

#### 5. Delete Brand (Soft-delete)
- **Method**: `DELETE`
- **Path**: `/api/v1/brands/:id`
- **Auth Required**: Yes (Role: `admin`)

---

### Product & Homepage Endpoints (`/api/v1/products`)

#### 1. Get Paginated & Filtered Products
- **Method**: `GET`
- **Path**: `/api/v1/products?page=1&limit=12&category=electronics&brand=apple&isFeatured=true&minPrice=10000&maxPrice=500000&sort=price_asc`
- **Auth Required**: No

#### 2. Get Product Details by Slug
- **Method**: `GET`
- **Path**: `/api/v1/products/:slug`
- **Auth Required**: No

#### 3. Create Product
- **Method**: `POST`
- **Path**: `/api/v1/products`
- **Auth Required**: Yes (Role: `admin`)
- **Content-Type**: `multipart/form-data`
- **Fields**: `name`, `description`, `shortDescription`, `category`, `brand`, `price`, `discountPrice` (< price), `currency` (`INR`), `stock`, `sku`, `specifications`, `tags`, `isFeatured`, `isBestSeller`, `images` (max 8), `video` (max 1)

#### 4. Update Product
- **Method**: `PATCH`
- **Path**: `/api/v1/products/:id`
- **Auth Required**: Yes (Role: `admin`)

#### 5. Quick Stock Adjustment
- **Method**: `PATCH`
- **Path**: `/api/v1/products/:id/stock`
- **Auth Required**: Yes (Role: `admin`)
- **Request Body**:
```json
{
  "stock": 25
}
```

#### 6. Delete Product (Hard-delete & Cloudinary media cleanup)
- **Method**: `DELETE`
- **Path**: `/api/v1/products/:id`
- **Auth Required**: Yes (Role: `admin`)

#### 7. Homepage Aggregated Product Sections
- **Method**: `GET`
- **Path**: `/api/v1/products/homepage`
- **Auth Required**: No
- **Returns**: Aggregated JSON containing `trending`, `flashSale`, `featured`, `bestSellers`, `topRated`, and `recentlyAdded` product arrays.

