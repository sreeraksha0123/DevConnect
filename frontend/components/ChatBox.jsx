import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";

// Very minimal demo chat: you type receiver id manually
export default function ChatBox() {
  const [socket, setSocket] = useState(null);
  const [receiverId, setReceiverId] = useState("");
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState("");
  const [user, setUser] = useState(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("devconnect_token")
      : null;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("devconnect_user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      const s = io(SOCKET_URL, { transports: ["websocket"] });
      s.emit("join", u.id);
      setSocket(s);

      s.on("receive_message", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => {
        s.disconnect();
      };
    }
  }, []);

  const loadHistory = async () => {
    if (!token || !receiverId || !user) return;
    try {
      const res = await axios.get(
        `${API_BASE}/api/chat/${receiverId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("History error:", err.response?.data || err.message);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!value.trim() || !receiverId || !user || !socket) return;

    try {
      await axios.post(
        `${API_BASE}/api/chat`,
        { receiverId, content: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      socket.emit("send_message", {
        senderId: user.id,
        receiverId,
        content: value,
      });
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          sender: user.id,
          receiver: receiverId,
          content: value,
          createdAt: new Date().toISOString(),
        },
      ]);
      setValue("");
    } catch (err) {
      console.error("Send message error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="card stack">
      <h3>Real-time Chat (demo)</h3>

      <input
        className="input"
        placeholder="Receiver user ID (Mongo ObjectId)"
        value={receiverId}
        onChange={(e) => setReceiverId(e.target.value)}
        onBlur={loadHistory}
      />

      <div
        style={{
          borderRadius: "0.75rem",
          border: "1px solid #1f2937",
          padding: "0.75rem",
          maxHeight: "260px",
          overflowY: "auto",
          background: "#020617",
        }}
      >
        {messages.map((m) => (
          <div
            key={m._id}
            style={{
              textAlign: m.sender === user?.id ? "right" : "left",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "0.45rem 0.7rem",
                borderRadius: "999px",
                background:
                  m.sender === user?.id ? "#22c55e22" : "#1f2937",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      <form
        onSubmit={sendMessage}
        style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}
      >
        <input
          className="input"
          placeholder="Type a message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
