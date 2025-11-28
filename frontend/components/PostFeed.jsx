import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

export default function PostFeed() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("devconnect_token")
      : null;

  const fetchFeed = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error("Feed error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [token]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/posts`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent("");
      fetchFeed();
    } catch (err) {
      console.error("Create post error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/api/posts/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFeed();
    } catch (err) {
      console.error("Like error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="stack" style={{ gap: "1rem" }}>
      <form className="card stack" onSubmit={handleCreatePost}>
        <h3>Share something with the community</h3>
        <textarea
          className="input"
          placeholder="What are you building today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="btn btn-primary" disabled={loading}>
          {loading ? "Posting..." : "Post"}
        </button>
      </form>

      {posts.map((post) => (
        <article key={post._id} className="card stack">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>{post.author?.name || "Unknown"}</strong>
              <div style={{ fontSize: "0.78rem", opacity: 0.7 }}>
                {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <p style={{ marginTop: "0.4rem" }}>{post.content}</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleToggleLike(post._id)}
          >
            ❤️ {post.likes?.length || 0} likes
          </button>
        </article>
      ))}
    </div>
  );
}
