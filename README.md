# 🎓 University Exam Management System

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-14.x-339933.svg?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-5.x-47A248.svg?logo=mongodb)

<div align="center">
  <img src="./diagram.svg" alt="University Exam Management System Architecture Diagram" width="800"/>
</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Setup & Installation](#-setup--installation)
  - [Prerequisites](#prerequisites)
  - [Client Setup](#client-setup)
  - [Server Setup](#server-setup)
  - [Environment Variables](#environment-variables)
- [Running the Application](#-running-the-application)
- [User Roles & Permissions](#-user-roles--permissions)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

## 🌟 Overview

The University Exam Management System is a comprehensive web application designed to streamline the process of scheduling, managing, and supervising university examinations. It provides tailored interfaces for administrators, teachers, and students, ensuring efficient exam session organization and transparent information dissemination.

> **Note:** This system helps universities efficiently handle the complex task of exam scheduling, resource allocation, and supervision management.

## ✨ Features

### For Administrators
- 👨‍💼 **User Management**: Add, edit, and delete user accounts with different roles
- 🏫 **Department & Section Management**: Organize academic structure
- 📚 **Subject Management**: Manage subjects 
- 👥 **Group Management**: Organize students into groups for exam sessions
- 🏢 **Classroom Management**: Configure exam venues and their capacities and features
- 📅 **Schedule Generation**: Create exam schedules and sessions list
- 📊 **Dashboard**: Comprehensive overview of system statistics 

### For Teachers
- 📝 **Supervision Schedule**: View assigned exam supervision duties
- ⏰ **Availability Management**: Set availability for exam supervision

### For Students
- 📝 **Exam Schedule**: Access personalized exam schedules
- 👤 **Profile Management**: Update personal information

## 🏗 Architecture

The application follows a client-server architecture:

- **Frontend**: Single-page application built with React
- **Backend**: RESTful API built with Node.js and Express
- **Database**: MongoDB for data persistence
- **Authentication**: JWT-based authentication and role-based access control

## 💻 Tech Stack

### Frontend
- **React**: UI library for building the user interface
- **Material-UI**: Component library for consistent and responsive design
- **React Router**: For navigation and routing
- **Axios**: HTTP client for API requests
- **Framer Motion**: For animations and transitions
- **Recharts**: For data visualization
- **Formik & Yup**: Form handling and validation

### Backend
- **Node.js**: JavaScript runtime for the server
- **Express**: Web framework for building the API
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication mechanism
- **Bcrypt**: Password hashing
- **Cors**: Cross-origin resource sharing
- **Dotenv**: Environment variable management

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v14.x or higher)
- MongoDB (v5.x or higher)
- npm or yarn package manager

### Client Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file in client directory
touch .env
```

### Server Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file in server directory
touch .env
```

### Environment Variables

#### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
```

#### Server (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/exam-management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

## 🏃‍♂️ Running the Application

### Running the Server

```bash
# Navigate to server directory
cd server

# Run in development mode
npm run dev

# Run in production mode
npm start
```

### Running the Client

```bash
# Navigate to client directory
cd client

# Run in development mode
npm start

# Build for production
npm run build
```

## 👥 User Roles & Permissions

### Administrator
- Full access to all system features
- User management capabilities
- Exam scheduling and oversight

### Teacher
- View assigned supervision duties
- Manage availability for supervision
- Access to relevant exam information

### Student
- View personal exam schedule
- Access only to their own data

## 📁 Project Structure

```
Gestion-Sessions/
│
├── client/                  # Frontend React application
│   ├── public/              # Static files
│   │   └── index.html       # HTML template
│   │
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context for global state
│   │   ├── layouts/         # Page layouts
│   │   ├── pages/           # Application pages by role
│   │   ├── services/        # API services
│   │   ├── theme/           # UI theme configuration
│   │   ├── types/           # TypeScript interfaces
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Main component
│   │   └── index.tsx        # Entry point
│   │
│   ├── package.json         # Frontend dependencies
│   └── tsconfig.json        # TypeScript configuration
│
├── server/                  # Backend Node.js application
│   ├── config/              # Configuration files
│   ├── controllers/         # API controllers
│   ├── middleware/          # Express middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── utils/               # Utility functions
│   ├── index.js             # Entry point
│   └── package.json         # Backend dependencies
│
└── README.md                # Project documentation
```

## 📝 API Documentation

The API follows RESTful conventions and is organized by resource type:

### Authentication Endpoints
- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration (admin only)

### User Endpoints
- `GET /api/users`: Get all users (admin only)
- `GET /api/users/:id`: Get user by ID
- `POST /api/users`: Create a new user (admin only)
- `PUT /api/users/:id`: Update a user
- `DELETE /api/users/:id`: Delete a user (admin only)

### Classroom Endpoints
- `GET /api/classrooms`: Get all classrooms
- `GET /api/classrooms/:id`: Get classroom by ID
- `POST /api/classrooms`: Create a new classroom (admin only)
- `PUT /api/classrooms/:id`: Update a classroom (admin only)
- `DELETE /api/classrooms/:id`: Delete a classroom (admin only)

### Subject Endpoints
- `GET /api/subjects`: Get all subjects
- `GET /api/subjects/:id`: Get subject by ID
- `POST /api/subjects`: Create a new subject (admin only)
- `PUT /api/subjects/:id`: Update a subject (admin only)
- `DELETE /api/subjects/:id`: Delete a subject (admin only)

### Session Endpoints
- `GET /api/sessions`: Get all exam sessions
- `GET /api/sessions/:id`: Get session by ID
- `POST /api/sessions`: Create a new session (admin only)
- `PUT /api/sessions/:id`: Update a session (admin only)
- `DELETE /api/sessions/:id`: Delete a session (admin only)

## 🧪 Testing

### Running Tests

```bash
# Client tests
cd client
npm test

# Server tests
cd server
npm test
```

## 📦 Deployment

### Production Build

```bash
# Build the client
cd client
npm run build

# Prepare server for production
cd server
npm run build
```

### Deployment Options

- **Heroku**: Easy deployment with MongoDB Atlas
- **AWS**: Scalable option for larger installations
- **Docker**: Containerized deployment for consistent environments
- **DigitalOcean**: Cost-effective cloud hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a new Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- Material-UI for the component library
- MongoDB for the database
- Node.js and Express for the backend framework
- React for the frontend library
- All contributors who have helped with the project

---

<div align="center">
  <p>Made with ❤️ for better university exam management</p>
</div>

