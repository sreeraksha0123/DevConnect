# 👨‍💻 DevConnect – Real‑Time Developer Community

DevConnect is a full‑stack social platform for developers to share updates, discuss ideas, and chat in real‑time.  
It’s intentionally scoped for portfolio use: small enough to run locally, but rich enough to showcase **JWT auth**,  
**MongoDB data modeling**, and **Socket.io** real‑time communication.

---

## 🧩 Tech Stack

**Backend**

- Node.js + Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT) for authentication
- Socket.io for real‑time messaging
- Bcrypt for password hashing
- CORS + dotenv

**Frontend**

- Next.js (Pages Router)
- React 18
- Axios for HTTP requests
- Socket.io Client
- Simple custom CSS (no UI framework to keep things transparent)

---

## 📁 Project Structure

```bash
DevConnect/
├── backend/
│   ├── server.js              # Express + Socket.io server
│   ├── package.json
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── userModel.js       # Users (auth, profile)
│   │   ├── postModel.js       # Posts & likes
│   │   └── messageModel.js    # Direct messages
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth/*
│   │   ├── postRoutes.js      # /api/posts/*
│   │   ├── chatRoutes.js      # /api/chat/*
│   │   └── authMiddleware.js  # JWT guard used across routes
│   ├── socket/
│   │   └── chatSocket.js      # Socket.io event handlers
│   └── controllers/
│       ├── authController.js  # register, login, me
│       ├── postController.js  # CRUD + like/unlike
│       └── chatController.js  # fetch + create messages
│
├── frontend/
│   ├── next.config.js
│   ├── package.json
│   ├── pages/
│   │   ├── _app.js            # Global styles
│   │   ├── index.js           # Login / Register
│   │   ├── dashboard.js       # Main feed
│   │   ├── profile.js         # Minimal profile page
│   │   └── chat.js            # Real‑time chat UI
│   ├── components/
│   │   ├── NavBar.jsx
│   │   ├── PostFeed.jsx
│   │   ├── Dashboard.jsx
│   │   └── ChatBox.jsx
│   └── styles/
│       └── globals.css
│
├── .env.example               # Example environment configuration
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### 1️⃣ Prerequisites

- Node.js **v18+**
- MongoDB running locally (or a connection string from MongoDB Atlas)

---

### 2️⃣ Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/DevConnect.git
cd DevConnect
```

#### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (you can base it on `.env.example` in the project root):

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/devconnect
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:3000
```

Start the API + Socket.io server:

```bash
npm run dev
```

You should see:

```text
✅ MongoDB connected successfully
✅ DevConnect backend listening on http://localhost:5001
```

---

#### Frontend

In another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (or re‑use the same values from `.env.example`):

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

Run the Next.js dev server:

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔐 Authentication Flow

- Users can **register** with name, email, and password.
- Passwords are hashed using **bcrypt** before being stored.
- On login, a **JWT** is issued and stored in `localStorage`:
  - `devconnect_token`
  - `devconnect_user`
- Protected routes on the backend require an `Authorization: Bearer <token>` header.

Key endpoints:

| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| POST   | `/api/auth/register` | Register a new user      |
| POST   | `/api/auth/login`    | Login, receive JWT       |
| GET    | `/api/auth/me`       | Get current user profile |

---

## 📝 Posts & Feed

- Users can create short text posts (status updates).
- Feed shows the latest posts with author & timestamp.
- Posts support **like / unlike**.

Endpoints:

| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| GET    | `/api/posts`          | Get feed (latest posts) |
| POST   | `/api/posts`          | Create a new post       |
| PUT    | `/api/posts/:id/like` | Toggle like/unlike      |
| DELETE | `/api/posts/:id`      | Delete own post         |

The feed is rendered by `frontend/components/PostFeed.jsx`.

---

## 💬 Real‑Time Chat (Socket.io)

- Socket.io server is attached to the same Express server.
- Each user joins a Socket.io **room** named after their MongoDB `_id`.
- When you send a message:
  - It’s saved to MongoDB.
  - Emitted in real‑time to the receiver’s room via `"receive_message"`.

Socket events used:

- `join` – client sends their `userId` after connecting.
- `send_message` – client sends `{ senderId, receiverId, content }`.
- `receive_message` – server emits to the receiver’s room.

HTTP endpoints:

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/api/chat/:otherUserId` | Get message history with a user    |
| POST   | `/api/chat`             | Persist a new direct message       |

The UI for this lives in `frontend/components/ChatBox.jsx`.  
For demo purposes, you manually paste a **receiver user ID** (MongoDB ObjectId) to start a conversation.

---

## 🧪 Things You Can Extend

If you want to keep improving this for your portfolio:

- Upload avatars & store URLs on the user model.
- Add comments to posts (schema is already ready for it).
- Show **online / offline** status via Socket.io rooms.
- Add notification toasts when new messages arrive.
- Build a “People” page that lists other developers.
- Replace manual receiver ID with a proper conversations list.

---

## 🧑‍💻 Scripts Reference

**Backend**

```bash
cd backend
npm run dev   # start development server with nodemon
npm start     # start in production mode
```

**Frontend**

```bash
cd frontend
npm run dev
npm run build
npm start
```

---

## 👤 Author

**Sree Raksha S P**

Feel free to fork, experiment, and adapt DevConnect into your own style of developer community.  
It’s designed to be a **clean, interview‑ready full‑stack project** that still leaves a lot of room for your creativity 🚀
