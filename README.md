# 🚀 Pet Care App – Backend

Backend API for **Pet Care App**, a full-stack pet care system.  
Built with Node.js, Express.js, and Supabase (PostgreSQL).  
Deployed on Render.

---

## 🚀 Live Demo

🌐 Frontend: [Vercel Frontend](https://pet-care-client-fawn.vercel.app/)  
🔗 Backend API: https://pet-care-server-f3zr.onrender.com  

---

## ⚡ Features

- **User Authentication**  
  - Signup: `POST /signup`  
  - Login: `POST /auth/login`  
  - Protected routes require JWT  

- **Pet Activities, Vaccinations, Appointments**
  - CRUD operations

- **Insurance Polycies**
  - Created by admin, Subscribed by user, Approval by admin

- **Post and Play dates**
  - Created by an user then other users can see, like and comment
  - Created by an user, others can see and respond

- **Cron**  
  - To send the notifications

---

## 🛠️ Tech Stack

- **Node.js** with **Express.js**  
- **Supabase** as database  
- **JWT** for authentication  
- **Bcrypt** for password hashing  
- **Node-cron** for scheduling tasks  
- **CORS** for cross-origin requests  
- **dotenv** for environment variables
  
---

## 🏗️ System Architecture

Client (React) → Express REST API → Supabase (PostgreSQL)  

---

## 📂 Project Structure

```
pet-care-server/
│
├── src/
│   ├── configs/             # Configuration files (DB connection, environment, etc.)
│   ├── controllers/         # Route controllers / business logic
│   ├── middlewares/         # Middlewares
│   ├── routes/              # Express route definitions
│   ├── utils/               # Helper functions
|   ├── models/              # Database queries
|   ├── cron                 # Notifications
│   └── utils/               # Services
│
├── .env                     # Environment variables (not committed)
├── .gitignore
├── index.js                # Server start file
├── README.md
├── LICENSE
├── package.json
└── package-lock.json
```
---

## 🗄️ Database Schema

The database schema is available in the `src/models/` file.  
It contains all table definitions, enum types, and constraints needed to set up the Supabase database.

---

## ⚙️ Installation & Setup

### Clone Repository

```bash
git clone https://github.com/jallurividya/pet-care-server.git
```

### Install Dependencies

```bash
npm install
```

### Database Setup

- Ensure Supabase is configured with the `.env` variables.
- Verify the database connection using `src/utils/checkDBConnection.js`.

### Run Development Server

```bash
npm index.js
```

### Production Mode

For production (Render), configure environment variables in:

Render → Environment → Environment Variables

---

🔑 Authentication

- Uses JWT for securing routes.
- Routes requiring authentication will expect a valid Authorization: Bearer <token> header.
- Passwords are hashed using bcrypt

---

# 👨‍💻 Author

** Vidya Sai Mounika Jalluri **  
Full Stack Web Developer  
Email: jallurividya2002@gmail.com
GitHub: https://github.com/jallurividya

---

⭐ If you found this project helpful, consider giving it a star!