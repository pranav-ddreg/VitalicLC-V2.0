# 🎯 VitaLC - Regulatory Compliance Management System

<div align="center">

**Enterprise-grade Regulatory Compliance Platform** 🏢📋

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black.svg)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green.svg)](https://mongodb.com/)
[![ESLint](https://img.shields.io/badge/ESLint-9.0+-red.svg)](https://eslint.org/)

*A complete full-stack solution for managing pre-registration, approvals, and regulatory compliance documents.*

</div>

---

## 📋 Table of Contents
- [🎯 Overview](#-overview)
- [🏗️ Architecture](#️-architecture)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Environment Setup](#️-environment-setup)
- [🖥️ Development](#️-development)
- [📊 Available Scripts](#-available-scripts)
- [🎣 Git Hooks & Quality Gates](#-git-hooks--quality-gates)
- [📁 Project Structure](#-project-structure)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📚 API Documentation](#-api-documentation)
- [🔧 Troubleshooting](#-troubleshooting)
- [📞 Support](#-support)

---

## 🎯 Overview

**VitaLC** is a comprehensive regulatory compliance management platform designed for healthcare and pharmaceutical companies. It streamlines the entire lifecycle of product registration, approval tracking, document management, and regulatory compliance processes.

**Key Business Domains:**
- 🏥 Pre-registration management
- 📋 Approval tracking and renewals
- 📁 Document lifecycle management
- 🌍 Multi-country regulatory compliance
- 👥 User role management and permissions
- 📊 Reporting and analytics

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Next.js 15    │────│  Express API    │
│   Frontend      │    │   Backend       │
│                 │    │                 │
│ • React 19      │    │ • TypeScript    │
│ • TypeScript    │    │ • MongoDB       │
│ • Tailwind CSS  │    │ • JWT Auth      │
│ • shadcn/ui     │    │ • File uploads  │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                 │
        ┌─────────────────┐
        │   MongoDB       │
        │   Database      │
        │                 │
        │ • Mongoose ODM  │
        │ • Document store│
        │ • GridFS        │
        └─────────────────┘
```

**Monorepo Structure:**
- **Frontend**: Next.js 15 with App Router
- **Backend**: Node.js with Express and TypeScript
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: AWS S3 with signed URLs
- **Authentication**: JWT with role-based access
- **Styling**: Tailwind CSS with shadcn/ui components

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Super Admin, Admin, User)
- Session management with MongoDB Store
- Password security with bcrypt

### 📋 Pre-registration Management
- Multi-country product registration tracking
- Approval timeline management
- Document attachment and validation
- Status tracking (Draft, Submitted, Approved, Rejected)

### 📊 Reporting & Analytics
- Custom export to Excel/PDF
- Pre-registration reports by country/product
- Approval timeline analytics
- User activity dashboard

### 📁 Document Management
- Secure file uploads with validation
- AWS S3 integration with signed URLs
- File type and size restrictions
- Document versioning and audit trails

### 🌐 Multi-country Support
- Country-specific regulatory requirements
- Approval timeline variations
- Local partner management
- Language and locale support

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks + Formik
- **HTTP Client**: Axios (for external APIs)
- **Icons**: Lucide React + React Icons

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript 5.9
- **Database**: MongoDB 7.0+
- **ODM**: Mongoose 6.x
- **Authentication**: jsonwebtoken + bcrypt
- **File Uploads**: formidable + AWS S3 SDK
- **Email**: Nodemailer + EJS templates

### Infrastructure & DevOps
- **Monorepo Tool**: Yarn Workspaces
- **Package Manager**: Yarn 1.22+
- **Git Hooks**: Husky v9 + lint-staged
- **Code Quality**: ESLint 9.0 + Prettier
- **Type Checking**: TypeScript strict mode
- **Testing**: Jest (configured but excluded from pre-commit)
- **Deployment**: Docker ready (future)

### External Services
- **File Storage**: AWS S3
- **Email Service**: SMTP/SendGrid compatible
- **Database**: MongoDB Atlas or self-hosted

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js**: `>=18.0.0` (Recommended: LTS version)
- **Yarn**: `>=1.22.0` (Package manager)
- **Git**: Latest version (for cloning and hooks)
- **MongoDB**: `>=7.0` (Database)

### IDE Recommendations
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier - Code formatter
  - Tailwind CSS IntelliSense

### System Requirements
- **RAM**: Minimum 8GB (Recommended: 16GB+)
- **Storage**: 2GB free space
- **Network**: Internet connection for dependencies

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/pranav-ddreg/VitalicLC-V2.0.git
cd vitallic-v2.0
```

### 2. Install Dependencies
```bash
# Install all dependencies for both client and server
yarn install
```
*Note: The first install may take 3-5 minutes due to workspace dependencies.*

### 3. Environment Setup
Copy the example environment files and configure them:
```bash
# Server environment setup
cp server/.env.example server/.env
# Edit server/.env with your configuration

# Client environment (if needed)
cp client/.env.example client/.env.local
```

### 4. Database Setup
Ensure MongoDB is running and accessible with the credentials in your `.env` file.

### 5. Start Development Server
```bash
# Start both frontend and backend
yarn dev

# Or start individually
yarn dev:client  # Frontend on http://localhost:3000
yarn dev:server  # Backend on http://localhost:9000
```

### 6. Setup Git Hooks (Husky)
Husky automatically manages Git hooks for code quality:

```bash
# Install Husky at workspace root (Windows compatible)
yarn add --dev -W husky

# Initialize Husky (creates .husky directory and hooks)
yarn husky init

# Make pre-commit hook executable (Windows)
git add .husky/pre-commit
git update-index --chmod=+x .husky/pre-commit
```

**Note**: Husky v9 automatically handles hook installation - no manual setup required on most systems.

### 7. First Commit (Test Everything)
```bash
git add .
git commit -m "feat: initial setup"
# Pre-commit hooks will run automatically and show:
# ✅ Formatting, linting, TypeScript, and build checks
```

**🎉 Your VitaLC application is now fully configured and running!**

---

## ⚙️ Environment Setup

### Server Environment (server/.env)
```bash
# Database Configuration
DB_URL=mongodb://localhost:27017
DB_NAME=vitalic_dev

# Server Configuration
PORT=9000
NODE_ENV=development

# JWT & Session Configuration
SESSION_SECRET_KEY=your-super-secret-key-here
JWT_SECRET=another-secret-for-jwt
JWT_EXPIRES_IN=24h

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=vitalic@company.com

# AWS S3 Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=your-bucket-name

# File Upload Configuration
FOLDER=/uploads  # Base folder path for uploads
MAX_FILE_SIZE=100000000  # 100MB in bytes
```

### Client Environment (client/.env.local) - *Optional*
```bash
# Next.js environment variables (if needed)
NEXT_PUBLIC_API_URL=http://localhost:9000
```

### Environment Variable Validation
The server includes **environment validation** - if any required variable is missing, the server will refuse to start with a clear error message.

Required variables:
- `DB_URL`, `DB_NAME`
- `SESSION_SECRET_KEY`
- `PORT`
- Email and AWS configs (optional for basic development)

---

## 🖥️ Development

### Running in Development Mode
```bash
# Full-stack development (recommended)
yarn dev

# Frontend only (if working on UI)
yarn dev:client

# Backend only (if working on API)
yarn dev:server
```

### Development Features
- **Hot Reload**: Both frontend and backend
- **TypeScript**: Full type checking with `--noEmit`
- **ESLint**: Real-time linting in IDE and pre-commit
- **Error Reporting**: Detailed startup sequence logging
- **Debug Mode**: `yarn dev:server:debug` for backend debugging

### Building for Production
```bash
# Build entire application
yarn build

# Build individually
yarn build:client  # Next.js optimized build
yarn build:server  # TypeScript compilation to JS
```

### Production Testing
```bash
# Run all quality checks before deployment
yarn test-all
```

---

## 📊 Available Scripts

### 🔥 Root Level Commands (Run from `/`)
```bash
# Development
yarn dev                    # Start both client & server
yarn dev:client            # Only frontend (Next.js)
yarn dev:server            # Only backend (Express)

# Building
yarn build                 # Build both workspaces
yarn build:client          # Build Next.js frontend
yarn build:server          # Build & compile TypeScript

# Quality Checks (Monorepo-wide)
yarn check-format          # Check code formatting
yarn check-lint            # Run ESLint
yarn check-types           # TypeScript compilation check
yarn format                # Auto-fix formatting
yarn lint                  # Auto-fix linting issues

# Comprehensive Testing
yarn test-all             # Full pipeline: format→lint→types→build
```

### 📱 Client Commands (`cd client`)
```bash
yarn dev                   # Start Next.js dev server
yarn build                 # Production build
yarn start                 # Production server
yarn check-types           # TypeScript validation
yarn check-format          # Prettier check
yarn check-lint            # ESLint check
yarn lint                  # Fix linting issues
yarn format               # Format code
```

### 🖥️ Server Commands (`cd server`)
```bash
yarn dev                   # Nodemon with ts-node
yarn dev:debug             # Debug mode
yarn build                 # TypeScript compilation
yarn start                 # Production server
yarn check-format          # Code formatting check
yarn check-lint            # ESLint validation
yarn format               # Auto-format code
yarn lint                 # Fix linting issues
yarn test                 # Jest tests (excluded from pre-commit)
```

---

## 🎣 Git Hooks & Quality Gates

### 🎯 Professional Pre-commit System

Our **Husky v9-powered pre-commit hooks** ensure code quality across the entire monorepo:

```
🏗️👷 Styling, testing and building your project before committing
🎯 Starting VitaLC Code Quality Gate...
🔧 Step 1: Checking Prettier formatting... ✅ PASSED ✨
🔧 Step 2: Checking ESLint rules... ✅ PASSED 🕵️‍♂️🔍
🔧 Step 3: Checking TypeScript compilation... ✅ PASSED 🔷⚡
🤔🤔🤔🤔... Alright.... Code looks good to me... Trying to build now.
⚙️  Step 4: Building both client and server... ✅ PASSED 🚀🔥
🎉 =========================================================================
🎉    CODE QUALITY CHECKS PASSED! COMMIT APPROVED!    '
🎉 =========================================================================
✅ Prettier formatting: PASSED ✨
✅ ESLint linting: PASSED 🔍
✅ TypeScript types: PASSED 🔷
✅ Full build: PASSED 🚀
✅✅✅✅ You win this time... I am committing this now!
```

### 🛡️ What Happens on Every Commit

#### 🔍 **Prettier Check**
- Code formatting consistency across the codebase
- Blocks commits if code is "disgusting" (unformatted)

#### 🕵️‍♂️ **ESLint Validation**
- Code quality and best practices enforcement
- Catches potential bugs and anti-patterns
- "Get that weak shit out of here!" for linting errors

#### 🔷 **TypeScript Compilation**
- Full type checking across client and server
- Catches type errors before they reach runtime
- "Failed Type check" with detailed error locations

#### 🚀 **Build Validation**
- Ensures the entire application compiles successfully
- Tests both Next.js and TypeScript compilation
- "Better call Bob... Because your build failed" for failures

### 🎪 Hook Features
- **Parallel Processing**: Faster checks where possible
- **Clear Error Messages**: Developer-friendly feedback
- **No Test Interference**: Tests excluded to avoid config issues
- **Immediate Blocking**: Failed checks prevent bad commits
- **Consistent Standards**: Same checks for all team members

### 🚫 Pre-commit Failure Example
```
🤢🤮🤢🤮 Its FOKING RAW - Your styling looks disgusting. 🤢🤮🤢🤮
Prettier Check Failed. Run yarn format, add changes and try commit again.
```

---

## 📁 Project Structure

```
vitaliclc-v2.0/                     # Monorepo Root
├── 📦 .husky/                      # Git Hooks (Husky v9)
│   └── pre-commit                  # Quality gates for commits
│
├── 📱 client/                      # Next.js Frontend
│   ├── 📱 app/                     # App Router Pages
│   │   ├── 📊 admin-tools/         # Admin dashboard pages
│   │   │   ├── 👥 company/page.tsx
│   │   │   ├── 🌍 countries/page.tsx
│   │   │   └── 👤 users/page.tsx
│   ├── 🧩 components/              # Reusable UI components
│   ├── 🎨 public/                  # Static assets
│   └── 🎯 Pages: dashboard, admin, product management
│
├── 🖥️ server/                      # Express.js Backend
│   ├── 🎯 controller/              # Business logic handlers
│   │   ├── 🔐 auth.ts              # Authentication
│   │   │   ├── company.ts          # Company management
│   │   │   └── ...                 # All entity controllers
│   ├── 📊 model/                   # Mongoose schemas
│   │   ├── 👤 user.ts              # User model
│   │   ├── 🏢 company.ts           # Company model
│   │   └── ...                     # All data models
│   ├── 🛣️ routes/                  # API routes
│   │   ├── 🔐 auth.ts              # Authentication API
│   │   ├── 🏢 company.ts           # Company API
│   │   └── ...                     # All API endpoints
│   ├── 🔧 services/                # Business services
│   │   ├── 📧 email.ts             # Email service
│   │   └── 📤 uploadsFiles.ts      # File upload service
│   ├── ✂️ utils/                   # Utility functions
│   └── ✅ validation/              # Input validation schemas
│
├── 📋 *package.json                # Monorepo configuration
├── 📚 *README.md                   # This file
└── 🌐 *Other configs               # ESLint, Prettier, etc.
```

### 📂 Key Files Explained

- **`.husky/pre-commit`**: Quality gates for all commits
- **`server/server.ts`**: Professional startup orchestration
- **`server/eslint.config.js`**: Modern ESLint v9 configuration
- **`client/eslint.config.mjs`**: Next.js ESLint configuration

---

## 🧪 Testing

### Test Configuration
```bash
# Backend tests (Jest configured but excluded from pre-commit)
cd server
yarn test              # Run all tests
yarn test:watch        # Watch mode
yarn test:coverage     # With coverage report
```

### Test Structure
```
server/tests/
├── controller/        # Controller unit tests
├── router/           # API route tests
└── integration/      # Full integration tests
```

### ⚠️ Note on Pre-commit Hooks
Tests are intentionally excluded from pre-commit hooks to avoid:
- Jest configuration complexity issues
- Slow commit times
- External dependency failures

**Run tests manually before pushing to main branches!**

---

## 🚢 Deployment

### Production Build Process
```bash
# 1. Full quality check
yarn test-all

# 2. Production build
yarn build

# 3. Environment validation
# Ensure production .env is configured

# 4. Server startup
cd server
yarn start  # Production server (compiled JS)
```

### Docker Support (Future)
```dockerfile
# Planned Docker configuration
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
RUN yarn build
EXPOSE 9000
CMD ["yarn", "start"]
```

### Server Startup Sequence (Production)
```
🎯 Starting VitaLC Server...
🔧 Step 1: Validating environment variables... ✅
🗄️  Step 2: Testing database connection... ✅
🚀 Step 3: Loading routes... ✅ (13 routes loaded!)
⚙️  Step 4: Configuring Express application... ✅
🔑 Step 5: Setting up session management... ✅
🔌 Step 7: Initializing Socket.IO... ✅
🛡️  Step 8: Setting up error handling... ✅
🚀 Step 9

## 🎯 Git Hooks (Centralized with Husky)

### Pre-commit Hook
Automatically runs on every commit and checks:

#### Client (Frontend)
- ✅ TypeScript type checking (`yarn check-types`)
- ✅ Code formatting (`yarn check-format`)
- ✅ Linting (`yarn check-lint`)

#### Server (Backend)
- ✅ Code formatting (`yarn check-format`)
- ✅ Linting (`eslint src --ext .ts,.js`)
- ✅ TypeScript compilation (`yarn build`)

### Behavior
- **Blocks commits** if any check fails
- **Parallel execution** for better performance
- **Clear output** showing status of each check
- **Immediate feedback** on failures

## 📁 Project Structure

```
vitaliclc-v2.0/
├── client/                 # Next.js frontend
│   ├── app/
│   ├── components/
│   └── public/
├── server/                 # Express.js backend
│   ├── controller/
│   ├── model/
│   ├── routes/
│   ├── services/
│   └── utils/
├── .husky/                 # Centralized git hooks (Husky v9)
│   └── pre-commit          # Monorepo-wide precommit hook
├── package.json            # Monorepo configuration
└── README.md
```

## 🔧 Centralized Tooling

- **Husky v9**: Modern git hooks management (no manual setup required)
- **Lint-staged**: File-specific linting (for future use)
- **Yarn Workspaces**: Monorepo dependency management
- **TypeScript**: Type safety across the entire codebase

## 🎉 Benefits of Centralized Setup

1. **Consistent Quality**: Every commit must pass the same checks
2. **Early Detection**: Catch issues before they reach CI/CD
3. **Team Alignment**: Same standards for frontend and backend
4. **Efficiency**: Parallel checks and clear feedback
5. **Monorepo Power**: Single command for entire project management

## 🚫 Commit Blocking

If any pre-commit check fails, the commit will be blocked with:
```
❌ CLIENT/SERVER: Some checks FAILED
🚫 COMMIT BLOCKED: Fix the failing checks before committing.
```

Fix the issues and commit again. The hook ensures code quality across the entire monorepo.

### Server Startup Sequence (Production)
```
🎯 Starting VitaLC Server...
🔧 Step 1: Validating environment variables... ✅
🗄️  Step 2: Testing database connection... ✅
🚀 Step 3: Loading routes... ✅ (13 routes loaded!)
⚙️  Step 4: Configuring Express application... ✅
🔑 Step 5: Setting up session management... ✅
🔌 Step 7: Initializing Socket.IO... ✅
🛡️  Step 8: Setting up error handling... ✅
🚀 Step 9: Starting server on port 9000... ✅
🎉 =========================================================================
🎉                 VitaLC Server Started Successfully!               '
🎉 =========================================================================
🚀 Server running on http://localhost:9000
✅ Environment validation: PASSED
✅ Database connection: PASSED
✅ Route loading: PASSED
✅ Socket.IO: INITIALIZED
🎉 =========================================================================
```

---

## 🤝 Contributing

Welcome to the VitaLC contribution guidelines! 🎉

### Development Workflow
1. **Fork & Clone**: Fork the repository and create your feature branch
2. **Setup**: Follow the Quick Start guide above
3. **Branch Naming**: Use `feat/`, `fix/`, `docs/` prefixes
4. **Code Style**: Follow ESLint + Prettier standards
5. **Testing**: Test your changes thoroughly
6. **Commit**: Use conventional commit messages
7. **Pre-commit**: Hooks will run automatically
8. **Pull Request**: Create PR with detailed description

### Code Standards
```bash
# Before committing, ensure:
✅ yarn check-format  # Code is properly formatted
✅ yarn check-lint    # No linting errors
✅ yarn check-types   # TypeScript compilation succeeds
✅ yarn build         # Full application builds

# Pre-commit hooks will enforce these automatically!
```

### Commit Message Format
```
type(scope): description

Examples:
feat(auth): add JWT token refresh
fix(api): handle null user in session
docs(readme): update environment setup
chore(deps): update TypeScript to 5.9.3
```

### Pull Request Guidelines
- **Title**: Clear, descriptive title
- **Description**: What, why, and how
- **Testing**: How to test the changes
- **Screenshots**: UI changes with before/after
- **Breaking Changes**: Clearly marked

---

## 📚 API Documentation

### Base URL (Development)
```
http://localhost:9000/api
```

### Authentication
Most endpoints require authentication. Include the session cookie or JWT token.

### Core API Endpoints

#### 🔐 Authentication
```http
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/logout
GET  /api/auth/me
```

#### 🏥 Pre-registration
```http
GET    /api/preregistration     # Get all (paginated)
POST   /api/preregistration     # Create new
GET    /api/preregistration/:id # Get single
PUT    /api/preregistration/:id # Update
DELETE /api/preregistration/:id # Delete
```

#### 🏢 Companies
```http
GET  /api/company              # Get all companies
POST /api/company              # Create company
GET  /api/company/:id          # Get single company
PUT  /api/company/:id          # Update company
```

#### 🌍 Countries & Products
```http
GET  /api/country              # Get all countries
GET  /api/product              # Get all products
GET  /api/product/:id/country  # Get product countries
```

### API Response Format
```json
{
  "code": "SUCCESS|ERROR|FETCHED|CREATED|UPDATED",
  "message": "Human readable message",
  "data": {
    // Response data
  }
}
```

### Error Responses
```json
{
  "code": "ERROROCCURED",
  "message": "Something went wrong"
}
```

### File Upload
The API supports multipart file uploads for:
- Registration certificates (PDF)
- Batch formula documents
- Product artwork (PIL)
- Other regulatory documents

Max file size: 100MB (configurable)

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### 🚫 "Database connection failed"
```bash
# Check MongoDB is running
mongod --version
sudo systemctl status mongod

# Verify connection string in .env
DB_URL=mongodb://localhost:27017
DB_NAME=vitalic_dev
```

#### 🚫 "Environment variables missing"
```bash
# Check .env file exists and is not empty
cat server/.env

# Required variables:
- PORT=9000
- DB_URL=mongodb://localhost:27017
- DB_NAME=vitalic_dev
- SESSION_SECRET_KEY=your-secret-key
```

#### 🚫 "ESLint not working"
```bash
# Check ESLint version
cd server
yarn eslint --version  # Should be 9.x.x

# Reset ESLint cache
rm node_modules/.cache -rf
yarn check-lint
```

#### 🚫 "TypeScript compilation errors"
```bash
# Check TypeScript version
cd server
npx tsc --version  # Should be 5.9.x

# Full type check
yarn check-types
```

#### 🚫 "Pre-commit hooks not running"
```bash
# Check Husky installation
yarn husky init

# Verify hook file permissions
ls -la .husky/pre-commit
# Should show executable permissions
```

#### 🚫 "Next.js build failing"
```bash
# Clear Next.js cache
cd client
rm -rf .next
yarn build

# Try development server
yarn dev
```

### Debug Mode
```bash
# Backend debug mode
cd server
yarn dev:debug

# View logs
tail -f server/logs/app.log
```

### Reset Development Environment
```bash
# Clean everything and restart
cd server
rm -rf node_modules dist
yarn install
yarn build
yarn dev

cd ../client
rm -rf node_modules .next
yarn install
yarn dev
```

---

## 📞 Support

### 🐛 Bug Reports
Use GitHub Issues:
1. **Title**: Clear, descriptive bug title
2. **Template**: Use bug report template
3. **Environment**: Include your setup details
4. **Reproduce**: Step-by-step reproduction instructions
5. **Expected**: What should happen
6. **Actual**: What actually happens

### 💡 Feature Requests
Use GitHub Issues with "Feature Request" label:
1. **Problem**: What problem does this solve?
2. **Solution**: Describe your proposed solution
3. **Alternatives**: Considered alternatives
4. **Impact**: How it affects users/developers

### 📧 Contact Information
- **Email**: support@vitalicglobal.com
- **GitHub Issues**: https://github.com/pranav-ddreg/VitalicLC-V2.0/issues
- **Documentation**: This README and inline code comments

### 📋 Best Practices for Support
- **Search First**: Check existing issues
- **Clear Description**: Include all relevant information
- **Code Examples**: Provide code snippets
- **Environment Details**: Node version, OS, etc.
- **Steps to Reproduce**: Detailed reproduction steps

---

## 🎉 Acknowledgments

Built with ❤️ by the VitaLC development team for healthcare regulatory compliance.

### Technologies Used
- **Next.js Team**: Amazing React framework
- **TypeScript Team**: Superior type safety
- **MongoDB Team**: Powerful document database
- **Express.js Team**: Reliable Node.js framework
- **Mongoose Team**: Excellent ODM

### Community
- ESLint & Prettier communities
- Yarn Workspaces ecosystem
- Open source contributors worldwide

---

<div align="center">

**Thank you for using VitaLC! 💫**

*Built for healthcare, engineered for excellence.* 🔬🏥

</div>

---

## 📋 Checklist for New Contributors

After cloning the repository, verify these work:
- [ ] `yarn install` completes successfully
- [ ] Environment variables are configured
- [ ] Database connection works
- [ ] `yarn dev` starts both servers
- [ ] Pre-commit hooks are functional
- [ ] `yarn test-all` passes
- [ ] Application is accessible at localhost

**Now you're ready to contribute to VitaLC!** 🚀</result>
