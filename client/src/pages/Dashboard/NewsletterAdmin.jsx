import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Users,
  Send,
  Trash2,
  FileText,
  Plus,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

const NewsletterAdmin = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("subscribers"); // subscribers, posts
  const [showCreatePost, setShowCreatePost] = useState(false);

  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [sendingId, setSendingId] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subRes, postRes] = await Promise.all([
        axios.get("/api/newsletter/subscribers"),
        axios.get("/api/newsletter/posts"),
      ]);
      setSubscribers(subRes.data);
      setPosts(postRes.data);
    } catch (err) {
      console.error("Error fetching newsletter data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/newsletter/posts", newPost);
      setNewPost({ title: "", content: "" });
      setShowCreatePost(false);
      fetchData();
      showStatus("success", "Post creato con successo");
    } catch (err) {
      showStatus("error", "Errore nella creazione del post");
    }
  };

  const handleSendPost = async (id) => {
    if (
      !window.confirm(
        "Sei sicuro di voler inviare questa newsletter a tutti gli iscritti verificati?",
      )
    )
      return;

    setSendingId(id);
    try {
      const res = await axios.post(`/api/newsletter/posts/${id}/send`);
      fetchData();
      showStatus("success", res.data.message);
    } catch (err) {
      showStatus("error", "Errore durante l'invio");
    } finally {
      setSendingId(null);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Eliminare questo post?")) return;
    try {
      await axios.delete(`/api/newsletter/posts/${id}`);
      fetchData();
      showStatus("success", "Post eliminato");
    } catch (err) {
      showStatus("error", "Errore eliminazione");
    }
  };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 4000);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: "400px" }}>
        <Loader2
          className="animate-spin"
          size={40}
          style={{ color: "var(--accent)" }}
        />
      </div>
    );
  }

  return (
    <div className="flex-col gap-8">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            className="title"
            style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}
          >
            Gestione <span className="text-gradient">Newsletter</span>
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Gestisci gli iscritti e invia comunicazioni.
          </p>
        </div>
        {activeTab === "posts" && (
          <button
            onClick={() => setShowCreatePost(true)}
            className="btn-primary"
            style={{
              width: "auto",
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
            }}
          >
            <Plus size={18} style={{ marginRight: "0.5rem" }} /> Nuovo Post
          </button>
        )}
      </header>

      {/* Status Alert */}
      <AnimatePresence>
        {status.message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              background:
                status.type === "success"
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(239,68,68,0.1)",
              border: `1px solid ${status.type === "success" ? "#22c55e" : "#ef4444"}`,
              color: status.type === "success" ? "#4ade80" : "#f87171",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            {status.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {status.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          background: "rgba(255,255,255,0.02)",
          padding: "0.5rem",
          borderRadius: "16px",
          border: "1px solid var(--border-subtle)",
          width: "fit-content",
        }}
      >
        <button
          onClick={() => setActiveTab("subscribers")}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "12px",
            border: "none",
            background: activeTab === "subscribers" ? "white" : "transparent",
            color: activeTab === "subscribers" ? "black" : "var(--text-muted)",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "var(--transition-smooth)",
          }}
        >
          <Users size={16} /> Iscritti ({subscribers.length})
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "12px",
            border: "none",
            background: activeTab === "posts" ? "white" : "transparent",
            color: activeTab === "posts" ? "black" : "var(--text-muted)",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "var(--transition-smooth)",
          }}
        >
          <FileText size={16} /> Post ({posts.length})
        </button>
      </div>

      <main>
        {activeTab === "subscribers" ? (
          <div
            className="card liquid-glass"
            style={{ border: "none", padding: 0, overflow: "hidden" }}
          >
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Stato</th>
                    <th>Data Iscrizione</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub._id}>
                      <td style={{ fontWeight: 600 }}>{sub.email}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background: sub.isVerified
                              ? "rgba(34,197,94,0.1)"
                              : "rgba(251,146,60,0.1)",
                            color: sub.isVerified ? "#4ade80" : "#fb923c",
                            borderColor: sub.isVerified
                              ? "rgba(34,197,94,0.2)"
                              : "rgba(251,146,60,0.2)",
                          }}
                        >
                          {sub.isVerified ? "Verificato" : "In Attesa"}
                        </span>
                      </td>
                      <td
                        style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}
                      >
                        {new Date(sub.subscribedAt).toLocaleDateString(
                          "it-IT",
                          { day: "numeric", month: "long", year: "numeric" },
                        )}
                      </td>
                    </tr>
                  ))}
                  {subscribers.length === 0 && (
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          textAlign: "center",
                          padding: "3rem",
                          color: "var(--text-dim)",
                        }}
                      >
                        Nessun iscritto trovato.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md-grid-cols-2 gap-6">
            {posts.map((post) => (
              <motion.div
                layout
                key={post._id}
                className="card"
                style={{
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                    {post.title}
                  </h3>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="btn-secondary"
                      style={{
                        padding: "0.5rem",
                        width: "auto",
                        borderRadius: "8px",
                        color: "#ef4444",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                    flex: 1,
                    maxHeight: "100px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {post.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "1rem",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.75rem",
                      color: "var(--text-dim)",
                    }}
                  >
                    {post.status === "sent" ? (
                      <>
                        <div
                          style={{
                            background: "#22c55e",
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                          }}
                        />
                        Inviato il {new Date(post.sentAt).toLocaleDateString()}
                      </>
                    ) : (
                      <>
                        <Clock size={14} />
                        Bozza
                      </>
                    )}
                  </div>
                  <button
                    disabled={sendingId === post._id}
                    onClick={() => handleSendPost(post._id)}
                    className="btn-primary"
                    style={{
                      width: "auto",
                      padding: "0.6rem 1.25rem",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {sendingId === post._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Send size={14} style={{ marginRight: "0.5rem" }} />{" "}
                        Invia Newsletter
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
            {posts.length === 0 && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "5rem",
                  color: "var(--text-dim)",
                  background: "rgba(255,255,255,0.01)",
                  borderRadius: "2rem",
                  border: "1px dashed var(--border-subtle)",
                }}
              >
                <FileText
                  size={48}
                  style={{ opacity: 0.2, marginBottom: "1rem" }}
                />
                <p>Non hai ancora creato nessun post.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem",
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setShowCreatePost(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="card liquid-glass"
              style={{
                width: "100%",
                maxWidth: "700px",
                padding: "3rem",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowCreatePost(false)}
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "1.5rem",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                }}
              >
                <X size={24} />
              </button>

              <h2
                className="title"
                style={{ fontSize: "2rem", marginBottom: "2rem" }}
              >
                Nuovo Post <span className="text-gradient">Newsletter</span>
              </h2>

              <form onSubmit={handleCreatePost} className="flex-col gap-6">
                <div className="input-group">
                  <label className="input-label">Titolo Oggetto Email</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    required
                    placeholder="es: Novità dello Studio - Bonus Esclusivi"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">
                    Contenuto (HTML supportato)
                  </label>
                  <textarea
                    className="input-field"
                    style={{ minHeight: "300px", resize: "vertical" }}
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    required
                    placeholder="Scrivi qui il corpo della newsletter..."
                  />
                </div>
                <div
                  style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}
                >
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(false)}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 1 }}
                  >
                    Salva Bozza
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsletterAdmin;
