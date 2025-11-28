import { useEffect } from "react";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import ChatBox from "../components/ChatBox";

export default function ChatPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("devconnect_token");
    if (!token) router.replace("/");
  }, [router]);

  return (
    <main className="main-layout">
      <NavBar />
      <ChatBox />
    </main>
  );
}
