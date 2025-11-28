import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("devconnect_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("devconnect_token");
    localStorage.removeItem("devconnect_user");
    router.push("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
      }}
    >
      <Link href="/dashboard">
        <span style={{ fontWeight: 700, fontSize: "1.2rem" }}>👨‍💻 DevConnect</span>
      </Link>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <Link href="/dashboard">Feed</Link>
        <Link href="/chat">Chat</Link>
        <Link href="/profile">Profile</Link>
        {user && (
          <>
            <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>
              {user.name.split(" ")[0]}
            </span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
