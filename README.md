
# 👩‍💻 DevConnect — Developer Community Platform

**DevConnect** is a full-stack social networking platform built for developers to connect, collaborate, and chat in real-time.
It’s designed as a **portfolio-grade project** showcasing modern full-stack architecture with authentication, real-time sockets, and PostgreSQL.

---

## 🚀 Features

* 🔐 **JWT Authentication** (Register / Login / Logout)
* 🧑‍💻 **User Profiles** with bio, skills, GitHub link, and avatars
* 🧵 **Feed & Posts** — create, like, and manage posts
* 💬 **Real-time Messaging** powered by Socket.io
* 🧠 **Skill-Based Matchmaking** — find other devs by interests
* 🌓 **Dark / Light Theme Support**
* ⚙️ **Fully Modular Backend API** built on Express
* ☁️ **PostgreSQL (Supabase)** integration with connection pooling
* 🧩 **Clean UI** built with React + TailwindCSS + Vite

---

## 🧩 Tech Stack

### 🖥️ Frontend

* **React 18** + **Vite**
* **TailwindCSS** for styling
* **Axios** for API requests
* **Socket.io Client** for real-time chat
* **React Context API** for auth + global state

### ⚙️ Backend

* **Node.js + Express**
* **PostgreSQL (via Supabase)** with `pg` Pool
* **JWT (jsonwebtoken)** for authentication
* **bcryptjs** for password hashing
* **Socket.io** for real-time WebSocket communication
* **dotenv** for environment management
* **CORS** for secure cross-origin access

---

## 🏗️ Project Structure

```bash
DevConnect/
├── client/                  # React + Vite Frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── contexts/        # AuthContext, ThemeContext
│   │   ├── pages/           # Feed, Chat, Profile, Auth
│   │   ├── utils/           # api.js, socket.js
│   │   └── App.jsx
│   ├── .env
│   ├── vite.config.js
│   └── package.json
│
├── server/                  # Express Backend
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── postsController.js
│   │   └── usersController.js
│   ├── middleware/
│   │   └── auth.js          # JWT verification
│   ├── models/
│   │   └── db.js            # PostgreSQL pool (Supabase)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── posts.js
│   │   └── users.js
│   ├── index.js             # Express + Socket.io entry
│   └── package.json
│
├── .gitignore
├── README.md
└── .env.example
```

---

## ⚙️ Setup Instructions

### 1️⃣ Prerequisites

* Node.js **v18+**
* PostgreSQL database (Supabase URL or local DB)
* npm or yarn

---

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/DevConnect.git
cd DevConnect
```

---

### 3️⃣ Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
PORT=5000
DATABASE_URL=your_supabase_postgres_connection_url
JWT_SECRET=your_super_secret_key
```

Run the backend:

```bash
npm run dev
```

✅ You should see:

```
✅ Server running on port 5000
📡 Socket.IO ready for connections
✅ Connected to Supabase PostgreSQL
```

---

### 4️⃣ Setup Frontend

In another terminal:

```bash
cd client
npm install
```

Create `.env` inside `/client`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=DevConnect
VITE_APP_ENV=development
```

Run the frontend:

```bash
npm run dev
```

Visit 👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔐 Authentication Endpoints

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| POST   | `/api/auth/register` | Register a new user          |
| POST   | `/api/auth/login`    | Login and get JWT            |
| GET    | `/api/auth/me`       | Fetch current logged-in user |

Passwords are securely hashed using **bcrypt**, and tokens are signed using **JWT_SECRET**.

---

## 🧵 Posts & Feed API

| Method | Endpoint              | Description             |
| ------ | --------------------- | ----------------------- |
| GET    | `/api/posts`          | Fetch all posts         |
| GET    | `/api/posts/:id`      | Fetch post by ID        |
| POST   | `/api/posts`          | Create a new post       |
| PUT    | `/api/posts/:id`      | Update an existing post |
| DELETE | `/api/posts/:id`      | Delete (soft delete)    |
| PUT    | `/api/posts/:id/like` | Like or unlike a post   |

Each post stores:

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "string",
  "content": "text",
  "tags": ["frontend", "react"],
  "likes": 12,
  "is_active": true
}
```

---

## 💬 Real-Time Chat (Socket.io)

When users log in, the frontend establishes a **Socket.io** connection with an auth token.
Each user joins a personal room (their user ID).

### Events:

| Event             | Direction       | Description           |
| ----------------- | --------------- | --------------------- |
| `connect`         | Client → Server | Auth handshake        |
| `join`            | Client → Server | User joins their room |
| `send_message`    | Client → Server | Send chat message     |
| `receive_message` | Server → Client | Deliver to recipient  |
| `disconnect`      | Socket          | Cleanup on logout     |

Messages are stored in PostgreSQL (`messages` table).

---

## 🧠 Database Schema (Supabase / PostgreSQL)

### `users`

| Column        | Type      | Description         |
| ------------- | --------- | ------------------- |
| id            | UUID (PK) | Primary key         |
| email         | TEXT      | Unique user email   |
| password_hash | TEXT      | Hashed password     |
| username      | TEXT      | Unique handle       |
| avatar_url    | TEXT      | Profile avatar      |
| bio           | TEXT      | Optional bio        |
| skills        | TEXT[]    | Developer skills    |
| github_url    | TEXT      | GitHub profile      |
| looking_for   | TEXT[]    | Interests           |
| theme         | TEXT      | UI theme preference |
| created_at    | TIMESTAMP | Auto timestamp      |

### `posts`

| Column     | Type      | Description       |
| ---------- | --------- | ----------------- |
| id         | UUID (PK) | Post ID           |
| user_id    | UUID (FK) | Author            |
| title      | TEXT      | Post title        |
| content    | TEXT      | Post content      |
| tags       | TEXT[]    | Tags/hashtags     |
| likes      | INT       | Number of likes   |
| is_active  | BOOLEAN   | Soft delete flag  |
| created_at | TIMESTAMP | Created timestamp |

---

## 🧱 Folder Highlights

**Auth Context (React)**
Manages token, user session, and API calls:

```jsx
const { user, login, logout } = useAuth();
```

**Socket Utility**
Handles real-time connection & events:

```js
socket = io(SOCKET_URL, { auth: { token } });
socket.emit("send_message", message);
```

---

## 🧑‍🎨 UI/UX Highlights

* 🎨 TailwindCSS for modern design
* 🧘‍♀️ Clean, minimal “chill dev space” theme
* 🌓 Theme toggle (dark/light)
* 🪶 Responsive layout for mobile + desktop
* 💬 Animated chat bubbles + real-time updates
* 🧑‍💻 Developer-centric color palette

---

## 🧠 Future Enhancements

* 🪩 GitHub OAuth login
* 💾 Cloud storage for avatars
* 🔔 Notifications via Socket.io
* 🤝 Follower / match system
* 🧮 AI-based skill similarity suggestions
* 📊 Admin dashboard for analytics

---

## 🧑‍💻 Author

**👩‍💻 Sree Raksha S P**

> Full-stack developer passionate about building clean, connected experiences for devs.
> Designed & built **DevConnect** to help developers find collaborators & share ideas.

🌐 [Portfolio (coming soon)](#)
🐙 [GitHub](https://github.com/YOUR_USERNAME)
