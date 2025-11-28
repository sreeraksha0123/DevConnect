import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await axios.post(`${API_BASE}${endpoint}`, form);
      localStorage.setItem("devconnect_token", res.data.token);
      localStorage.setItem("devconnect_user", JSON.stringify(res.data.user));
      router.push("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-layout">
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          marginTop: "3rem",
        }}
      >
        <h1 style={{ fontSize: "2.3rem", marginBottom: "0.5rem" }}>
          👨‍💻 DevConnect
        </h1>
        <p style={{ opacity: 0.8 }}>
          A focused space for developers to share progress, ask questions, and chat in real time.
        </p>
      </div>

      <section
        className="card"
        style={{ maxWidth: 420, margin: "0 auto", marginBottom: "2rem" }}
      >
        <h2 style={{ marginBottom: "1rem" }}>
          {isLogin ? "Welcome back" : "Create your account"}
        </h2>

        <form className="stack" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              className="input"
              placeholder="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          )}
          <input
            className="input"
            placeholder="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <input
            className="input"
            placeholder="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <button className="btn btn-primary" disabled={loading} type="submit">
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign up"}
          </button>
        </form>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          {isLogin ? "Need an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ paddingInline: "0.75rem" }}
            onClick={() => setMode(isLogin ? "signup" : "login")}
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>
      </section>
    </main>
  );
}
