# 🚀 QuickServe – Grocery Delivery Backend API

A scalable RESTful backend for a grocery delivery platform built using **Node.js**, **Express.js**, and **MongoDB**. The project provides secure authentication, product management, cart functionality, order processing, payment integration, and image upload capabilities.

---

## ✨ Features

- 🔐 JWT Authentication & Authorization
- 👥 Role-Based Access Control
- 🛒 Shopping Cart Management
- 📦 Product Management
- 📋 Order Management
- 👤 User Management
- 💳 Stripe Payment Integration
- ☁️ Cloudinary Image Uploads
- 📧 Email Services using Nodemailer
- ✅ Request Validation
- 🛡 Helmet Security
- 🌐 CORS Configuration
- 📝 Request Logging with Morgan
- 📁 File Uploads using Multer

---

## 🛠 Tech Stack

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- JWT (JSON Web Token)
- bcrypt

### Cloud Services

- Cloudinary
- Stripe
- Nodemailer

### Validation & Security

- Joi
- Express Validator
- Helmet
- CORS

### File Upload

- Multer

---

## 📂 Project Structure

```
QuickServe-Backend
│
├── controllers/
├── routes/
├── models/
├── middlewares/
├── services/
├── utils/
├── config/
├── validators/
├── uploads/
├── index.js
└── package.json
```

---

## 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/RishangAshishVerma/QuickServe-Backend.git
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory.

Example:

```env
PORT=5000

MONGODB_URI=your_database_url

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=your_stripe_key

EMAIL_USER=your_email
EMAIL_PASS=your_password
```

### Run Development Server

```bash
npm run dev
```

---

## 📌 API Modules

- Authentication
- Users
- Products
- Categories
- Cart
- Orders
- Payments
- Image Upload

---

## 🔒 Security Features

- JWT Authentication
- Role-Based Authorization
- Password Hashing
- Request Validation
- Helmet
- CORS
- Protected Routes

---

## 📅 Upcoming Features

- Docker Support
- Swagger API Documentation
- Unit Testing (Jest)
- Integration Testing (Supertest)
- Redis Caching
- GitHub Actions CI/CD
- Refresh Token Authentication
- Email Verification
- Password Reset
- Pagination
- Search & Filtering
- API Versioning
- Performance Optimizations

---

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome. Feel free to fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Rishang Ashish Verma**

GitHub: https://github.com/RishangAshishVerma

---

⭐ If you found this project useful, consider giving it a star!
