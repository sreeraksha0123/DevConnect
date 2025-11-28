import { useEffect } from "react";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import Dashboard from "../components/Dashboard";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("devconnect_token");
    if (!token) router.replace("/");
  }, [router]);

  return (
    <main className="main-layout">
      <NavBar />
      <Dashboard />
    </main>
  );
}
