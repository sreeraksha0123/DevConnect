import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("devconnect_user");
    if (!stored) {
      router.replace("/");
    } else {
      setUser(JSON.parse(stored));
    }
  }, [router]);

  if (!user) return null;

  return (
    <main className="main-layout">
      <NavBar />
      <section className="card stack">
        <h2>Your profile</h2>
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p style={{ opacity: 0.8 }}>
          This is a minimal profile stub – you can extend it with avatar upload,
          GitHub links, tech stack badges, and more.
        </p>
      </section>
    </main>
  );
}
