# 🧑‍🤝‍🧑 Missing Person Finder

A full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** web application designed to assist in reporting, tracking, and managing missing person cases. The platform provides a secure and user-friendly environment where users can submit missing person reports, search existing cases, and help reconnect missing individuals with their families.


---

# 📖 Overview

Missing Person Finder is a role-based web application developed to simplify the process of reporting and managing missing person cases.

Users can register an account, securely log in, create reports by providing personal details and photographs of missing individuals, and monitor the status of their reports. The application also provides an administrative dashboard where administrators can manage all reports and update their status when a person has been found.

The system follows a secure authentication and authorization mechanism using JSON Web Tokens (JWT), ensuring that only authorized users can access protected features.

---

# 🎯 Problem Statement

Many missing person reports are scattered across different platforms, making it difficult for families and authorities to organize and track information effectively.

This application provides a centralized platform where:

- Missing person reports can be created quickly.
- Information is easily searchable.
- Administrators can manage reported cases.
- Families can monitor report status.

---

# 🚀 Features

## 🔐 Authentication

- User Registration
- User Login
- Password Encryption using bcrypt
- JWT Authentication
- Protected Routes

---

## 👤 User Features

- Register a new account
- Secure Login
- Report a Missing Person
- Upload Person's Photograph
- View All Missing Person Reports
- Search Missing Persons
- Filter Reports
- View Personal Reports
- Delete Own Reports
- Mark Own Report as Found

---

## 🛡️ Admin Features

- View All Reports
- Manage Every User's Reports
- Mark Any Report as Found
- Delete Any Report
- Role-Based Authorization

---

# ⚙️ How the Application Works

## Step 1 — User Registration

A new user creates an account by entering:

- Name
- Email
- Password

The password is securely encrypted before being stored in MongoDB.

---

## Step 2 — Login

The user logs into the application.

After successful authentication:

- JWT Token is generated.
- Token is stored in the browser.
- Protected pages become accessible.

---

## Step 3 — Report Missing Person

The user fills in information such as:

- Name
- Age
- Gender
- Last Seen Location
- Date Missing
- Description
- Contact Information
- Photograph

The image is uploaded to **Cloudinary**.

The remaining details are stored in **MongoDB**.

---

## Step 4 — Home Dashboard

After login, users can:

- View all reports
- Search by person's name
- Filter reports
- View report details

---

## Step 5 — User Profile

Users can:

- View reports they created
- Delete their own reports
- Mark their own reports as **Found**

---

## Step 6 — Found Persons

Whenever a report status changes to **Found**, it automatically appears in the Found Persons section.

This helps separate resolved cases from active missing person reports.

---

## Step 7 — Admin Dashboard

The administrator has complete control over all reports.

Admin can:

- View every report
- Delete any report
- Mark any report as Found

This is achieved using **Role-Based Authorization**.

---

# 🔐 Authentication & Authorization

Authentication is implemented using **JSON Web Tokens (JWT).**

After login:

- JWT Token is generated
- Token is verified for every protected request
- Unauthorized users cannot access protected APIs

Authorization is role-based.

The following users are allowed to update or delete reports:

- Original Report Creator
- Administrator

---

# 🗄️ Database

MongoDB stores:

## User Collection

- Name
- Email
- Password
- isAdmin

---

## Report Collection

- Missing Person Name
- Age
- Gender
- Last Seen Location
- Description
- Contact Details
- Image URL
- Status
- Report Creator
- Created Date

---

# ☁️ Image Storage

Images are uploaded using **Cloudinary**.

Benefits:

- Secure Storage
- Faster Image Loading
- Cloud-Based Image Management

---

# 🛠️ Technologies Used

## Frontend

- React.js
- React Router DOM
- Axios
- HTML5
- CSS3
- JavaScript (ES6)

---

## Backend

- Node.js
- Express.js

---

## Database

- MongoDB
- Mongoose

---

## Authentication

- JSON Web Token (JWT)
- bcrypt.js

---

## Cloud Services

- Cloudinary

---

## Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- MongoDB Atlas

---

# 📂 Project Structure

```
Missing-Person-Finder

├── client
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server
│   ├── config
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── uploads
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# 💻 Installation

## Clone Repository

```bash
git clone https://github.com/Madhumitha2k05/your-repository-name.git
```

## Install Backend

```bash
cd server
npm install
```

Start Backend

```bash
npm start
```

---

## Install Frontend

```bash
cd client
npm install
```

Start Frontend

```bash
npm start
```

---

# 🔑 Environment Variables

Create a `.env` file inside the **server** directory.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret
```

---

# 📚 Learning Outcomes

This project helped me gain practical experience in:

- Full Stack Web Development
- MERN Stack Development
- REST API Development
- MongoDB Database Design
- Authentication & Authorization
- CRUD Operations
- Cloudinary Integration
- Protected Routes
- Role-Based Access Control
- Responsive UI Design
- Git & GitHub Workflow

---

# 🔮 Future Enhancements

- Email Notifications
- AI-Based Face Recognition
- Google Maps Integration
- Real-Time Report Updates
- Mobile Application
- Multi-Language Support

---

# 👩‍💻 Author

**Madhumitha K**

Artificial Intelligence and Data Science Student

GitHub: https://github.com/Madhumitha2k05

LinkedIn: https://www.linkedin.com/in/madhumithak2005

---

# 📜 Copyright

© 2026 Madhumitha K.

This project is provided for portfolio and demonstration purposes only.

Unauthorized copying, modification, redistribution, or commercial use of this project is not permitted without prior written permission.
