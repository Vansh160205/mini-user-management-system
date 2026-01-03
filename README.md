# Mini User Management System

A full-stack web application for managing user accounts with secure authentication, role-based authorization, and comprehensive user lifecycle management.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![React](https://img.shields.io/badge/React-18.x-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)
---

Demo video : [demo video](https://drive.google.com/file/d/1D2oLdd48VwzyuH27Y_Mb_tCNwvXqyf1R/view?usp=drive_link)
---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
  - [Environment Setup](#environment-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

The **Mini User Management System** is a production-ready full-stack application that demonstrates modern web development best practices. It provides a complete solution for user authentication, authorization, and management with a clean, responsive user interface.

### Key Highlights

- 🔐 **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- 👥 **Role-Based Access Control** - Admin and User roles with protected routes
- 📱 **Responsive Design** - Mobile-first UI built with Tailwind CSS
- 🧪 **Tested** - Comprehensive unit tests for backend API
- 🚀 **Production Ready** - Deployable to cloud platforms

---

## ✨ Features

### Authentication
- ✅ User registration with email validation
- ✅ Strong password requirements enforcement
- ✅ Secure login with JWT token
- ✅ Token verification and refresh
- ✅ Logout functionality

### User Management (Admin)
- ✅ View all users with pagination
- ✅ Search users by name or email
- ✅ Filter users by role and status
- ✅ Activate/deactivate user accounts
- ✅ Delete users
- ✅ View user statistics

### User Management (User)
- ✅ View own profile
- ✅ Update profile information
- ✅ Change password

### Security
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Input validation
- ✅ CORS configuration
- ✅ HTTP-only considerations

### UI/UX
- ✅ Clean, modern interface
- ✅ Responsive design (mobile & desktop)
- ✅ Loading states and spinners
- ✅ Toast notifications
- ✅ Form validation feedback
- ✅ Error handling

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| PostgreSQL | Database |
| JWT | Authentication tokens |
| bcrypt | Password hashing |
| Jest | Testing framework |
| Supertest | HTTP testing |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| Vite | Build tool |
| React Router | Routing |
| Tailwind CSS | Styling |
| Axios | HTTP client |
| Context API | State management |

### DevOps
| Technology | Purpose |
|------------|---------|
| Git | Version control |
| npm | Package management |
| ESLint | Code linting |
| dotenv | Environment variables |

---

## 📁 Project Structure

```
mini-user-management/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── database/       # Database init and seed scripts
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── app.js          # Express app setup
│   ├── tests/              # Unit tests
│   ├── .env.example        # Environment variables template
│   ├── package.json
│   └── server.js           # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Route configuration
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Root component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── .env.example        # Environment variables template
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **PostgreSQL** (v14.0 or higher)
- **Git**

### Verify Installation

```bash
node --version    # Should be v18.x.x or higher
npm --version     # Should be v9.x.x or higher
psql --version    # Should be v14.x or higher
```

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/yourusername/mini-user-management.git
cd mini-user-management
```

### Environment Setup

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/user_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

#### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
cp .env.example .env
```

Edit the `.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Mini User Management System
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Initialize the database (creates tables)
npm run db:init

# Seed the database with sample data
npm run db:seed

# Or run both commands at once
npm run db:setup
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

---

## 💻 Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will start at `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Production Mode

#### Backend

```bash
cd backend
npm start
```

#### Frontend

```bash
cd frontend
npm run build
npm run preview
```

### Default Credentials

After seeding the database, you can use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@123456 |
| User | user@example.com | User@123456 |

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register a New User

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password@123",
  "full_name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user",
      "status": "active"
    },
    "token": "jwt-token"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt-token"
  }
}
```

#### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Verify Token

```http
POST /api/auth/verify
Authorization: Bearer <token>
```

### User Management Endpoints

#### Get All Users (Admin Only)

```http
GET /api/users?page=1&limit=10&role=user&status=active&search=john
Authorization: Bearer <admin-token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |
| role | string | Filter by role (admin/user) |
| status | string | Filter by status (active/inactive) |
| search | string | Search by name or email |
| sortBy | string | Sort field (default: created_at) |
| sortOrder | string | Sort order (asc/desc) |

#### Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User

```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "email": "updated@example.com"
}
```

#### Change Password

```http
PATCH /api/users/:id/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "OldPassword@123",
  "new_password": "NewPassword@123"
}
```

#### Activate User (Admin Only)

```http
PATCH /api/users/:id/activate
Authorization: Bearer <admin-token>
```

#### Deactivate User (Admin Only)

```http
PATCH /api/users/:id/deactivate
Authorization: Bearer <admin-token>
```

#### Delete User (Admin Only)

```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

#### Get User Statistics (Admin Only)

```http
GET /api/users/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "adminCount": 5,
    "userCount": 95,
    "activeCount": 90,
    "inactiveCount": 10
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## 🧪 Testing

### Running Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch

# Run tests with verbose output
npm run test:verbose
```

### Test Coverage

The test suite covers:

- ✅ User registration (signup)
- ✅ User login
- ✅ Token verification
- ✅ Protected route access
- ✅ Admin RBAC
- ✅ User activation/deactivation
- ✅ Password change
- ✅ User CRUD operations
- ✅ Middleware functionality

---

## 🌐 Deployment

### Backend Deployment (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add environment variables in Render dashboard
5. Deploy

### Backend Deployment (Railway)

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy

### Frontend Deployment (Vercel)

1. Import your repository on [Vercel](https://vercel.com)
2. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add environment variables
4. Deploy

### Frontend Deployment (Netlify)

1. Import your repository on [Netlify](https://netlify.com)
2. Configure:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
3. Add environment variables
4. Add `_redirects` file for SPA routing:
   ```
   /*    /index.html   200
   ```
5. Deploy

### Database (PostgreSQL)

Recommended cloud PostgreSQL providers:

- [Render PostgreSQL](https://render.com/docs/databases)
- [Railway PostgreSQL](https://docs.railway.app/databases/postgresql)
- [Supabase](https://supabase.com)
- [ElephantSQL](https://www.elephantsql.com)
- [Neon](https://neon.tech)

### Environment Variables for Production

**Backend:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your-production-database-url
JWT_SECRET=your-secure-production-secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=https://your-frontend-domain.com
```

**Frontend:**
```env
VITE_API_URL=https://your-backend-api.com/api
VITE_APP_NAME=Mini User Management System
```

---

## 📸 Screenshots

### Login Page
![Login Page](docs/screenshots/login.png)

### Dashboard (Admin)
![Admin Dashboard](docs/screenshots/dashboard-admin.png)

### User Management
![User Management](docs/screenshots/users.png)

### Profile Page
![Profile Page](docs/screenshots/profile.png)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m 'feat: add your feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/config changes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Your Name**

- GitHub: [@Vansh160205](https://github.com/Vansh160205)
- LinkedIn: [Vansh Vagadia](https://linkedin.com/in/vansh-vagadia)

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PostgreSQL](https://www.postgresql.org/)

---

<p align="center">
  Made with ❤️ for the technical assessment
</p>

---
## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
