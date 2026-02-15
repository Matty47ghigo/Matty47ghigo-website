import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

const NewsletterVerify = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token di verifica mancante.");
        return;
      }

      try {
        const res = await axios.get(`/api/newsletter/verify?token=${token}`);
        setStatus("success");
        setMessage(res.data.message);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Errore durante la verifica della newsletter.",
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-black)",
        padding: "1.5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="bg-noise" />
      <div className="top-glow" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card liquid-glass"
        style={{
          width: "100%",
          maxWidth: "500px",
          padding: "4rem 2rem",
          textAlign: "center",
          borderRadius: "2.5rem",
          border: "1px solid rgba(255,255,255,0.1)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {status === "loading" && (
          <div className="flex-col flex-center gap-6">
            <Loader2
              size={48}
              className="animate-spin"
              style={{ color: "var(--accent)" }}
            />
            <h2 className="title" style={{ fontSize: "1.5rem" }}>
              Verifica in corso...
            </h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex-col flex-center">
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "rgba(34,197,94,0.1)",
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#22c55e",
                marginBottom: "2rem",
              }}
            >
              <CheckCircle2 size={40} />
            </div>
            <h2
              className="title"
              style={{ fontSize: "2rem", marginBottom: "1rem" }}
            >
              Evviva! 🎁
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "2.5rem",
                lineHeight: 1.6,
              }}
            >
              La tua iscrizione è stata confermata! Abbiamo inviato il tuo{" "}
              <b>codice sconto da 30€</b> al tuo indirizzo email.
            </p>

            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                padding: "2rem",
                borderRadius: "1.5rem",
                border: "1px solid var(--border-subtle)",
                width: "100%",
                marginBottom: "2rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-dim)",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Il tuo regalo
              </p>
              <h3
                style={{ fontSize: "2.5rem", fontWeight: 900, color: "white" }}
              >
                SCONTO30
              </h3>
            </div>

            <Link
              to="/shop"
              className="btn-primary"
              style={{
                padding: "1rem 2rem",
                width: "100%",
                borderRadius: "50px",
                textDecoration: "none",
              }}
            >
              Vai allo Shop{" "}
              <ShoppingBag size={18} style={{ marginLeft: "0.5rem" }} />
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex-col flex-center">
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "rgba(239,68,68,0.1)",
                borderRadius: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ef4444",
                marginBottom: "2rem",
              }}
            >
              <XCircle size={40} />
            </div>
            <h2
              className="title"
              style={{ fontSize: "2rem", marginBottom: "1rem" }}
            >
              Ops!
            </h2>
            <p
              style={{
                color: "var(--text-muted)",
                marginBottom: "2.5rem",
                lineHeight: 1.6,
              }}
            >
              {message}
            </p>
            <Link
              to="/"
              className="btn-secondary"
              style={{
                padding: "1rem 2rem",
                width: "100%",
                borderRadius: "50px",
                textDecoration: "none",
              }}
            >
              Torna alla Home{" "}
              <ArrowRight size={18} style={{ marginLeft: "0.5rem" }} />
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default NewsletterVerify;
