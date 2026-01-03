# Internship Attendance Tracker

> A modern, full-stack internship attendance tracker built with the MERN stack

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

## Overview

Internship Attendance Tracker is a comprehensive web application designed to help students and professionals track their internship hours, monitor progress, and calculate completion dates. Built with modern web technologies, it provides an intuitive interface for managing daily attendance, configuring working schedules, and visualizing progress toward internship goals.

### Key Features

- **Smart Progress Tracking** - Real-time calculation of completion dates based on your schedule
- **Flexible Calendar** - Visual calendar interface with holiday management and weekend exclusions
- **Daily Hour Logging** - Easy-to-use interface for logging daily work hours with automatic time calculation
- **Dashboard Analytics** - Overview of progress, statistics, and milestones
- **Lunch Break Configuration** - Optional lunch break deduction from work hours
- **Default Work Hours** - Pre-configured start and end times for quick logging
- **Secure Authentication** - JWT-based authentication with simplified password reset
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## Use Cases

Perfect for:
- Students tracking required internship hours
- Companies monitoring intern attendance
- Professionals managing work hour requirements
- Anyone needing to track time-based goals

## Tech Stack

### Frontend
- **React** - UI library with hooks
- **React Router** - Navigation
- **Vite** - Build tool and development server
- **Axios** - HTTP client
- **date-fns** - Date manipulation
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **react-calendar** - Calendar component
- **react-datepicker** - Date picker component

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **express-rate-limit** - Rate limiting
- **helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## Project Structure

```
internship-attendance/
├── backend/
│   ├── models/          # Mongoose models (User, Attendance)
│   ├── routes/          # API routes (auth, user, attendance)
│   ├── middleware/      # Custom middleware (authentication)
│   ├── utils/           # Helper functions (date calculations, token generation)
│   └── server.js        # Entry point
│
├── frontend/
│   ├── index.html       # HTML template
│   ├── vite.config.js   # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── src/
│       ├── components/  # Reusable components (Navbar, AttendanceModal, etc.)
│       ├── pages/       # Page components (Dashboard, Attendance, Settings, etc.)
│       ├── context/     # React Context (AuthContext)
│       ├── App.jsx      # Main app component
│       ├── main.jsx     # Application entry point
│       └── index.css    # Global styles
│
├── QUICKSTART.md        # Quick start guide
└── README.md
```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/verify-email` | Check if email exists | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| GET | `/api/auth/verify` | Verify JWT token | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user/profile` | Get user profile | Yes |
| PUT | `/api/user/profile` | Update user profile | Yes |
| GET | `/api/user/config` | Get internship config | Yes |
| PUT | `/api/user/config` | Update internship config | Yes |

### Attendance Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/attendance` | Create attendance entry | Yes |
| GET | `/api/attendance` | Get all attendance entries | Yes |
| GET | `/api/attendance/:id` | Get single entry | Yes |
| PUT | `/api/attendance/:id` | Update entry | Yes |
| DELETE | `/api/attendance/:id` | Delete entry | Yes |
| GET | `/api/attendance/stats` | Get statistics | Yes |
| GET | `/api/attendance/calendar/:year/:month` | Get month view | Yes |

## Features in Detail

### Dashboard
- **Progress Overview** - Circular progress indicator showing completion percentage
- **Quick Stats** - Total hours logged, hours remaining, average daily hours
- **Completion Prediction** - Calculated expected finish date based on working days and holidays
- **Weekly Summary** - Hours and days logged for the current week
- **Monthly Summary** - Hours and days logged for the current month with comparison to previous month
- **Upcoming Milestones** - Display of 25%, 50%, 75%, and 100% completion milestones

### Calendar View
- **Visual Hour Tracking** - Color-coded days based on logged hours
- **Holiday Management** - Mark non-working days with a single click
- **Weekend Exclusion** - Option to exclude weekends from calculations
- **Month Navigation** - Easy navigation between months
- **List View** - Alternative table view of all attendance entries

### Hour Logging
- **Quick Entry** - Log hours with date picker and simple input
- **Time Range Input** - Optional start and end time with automatic hour calculation
- **Lunch Break Deduction** - Automatic deduction of configured lunch break hours
- **Default Times** - Pre-filled start and end times from user configuration
- **Flexible Input** - Supports decimal hours (e.g., 6.5)
- **Optional Notes** - Add daily notes or descriptions
- **Edit History** - Modify or delete past entries

### Settings
- **Target Hours** - Set total required internship hours
- **Start Date** - Define when internship began
- **Working Days** - Configure which days count toward completion
- **Default Work Hours** - Set default start and end times for attendance logging
- **Lunch Break** - Enable/disable lunch break and configure duration
- **Holidays** - Select multiple holiday dates via interactive calendar

### Profile
- **User Information** - Update first name and last name
- **Email Display** - View email address (non-editable)

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt (10 salt rounds)
- Input validation on frontend and backend
- Rate limiting on authentication endpoints
- CORS configuration
- Helmet.js for security headers
- Protected API routes

## License

This project is licensed under the MIT License.

## Author

- **Luis Laguardia** - *Initial work* - [GitHub](https://github.com/luuuuuuuilaguardia)

## Contact

Have questions or suggestions? Reach out!

- **Email**: luislaguardia@protonmail.com

---
