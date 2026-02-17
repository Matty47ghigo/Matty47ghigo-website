import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check, Shield } from "lucide-react";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000);
    } else {
      setIsAccepted(consent === "accepted");
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsAccepted(true);
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected");
    setIsAccepted(false);
    setIsVisible(false);
    // Clear any existing auth cookies if user rejects
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          width: "90%",
          maxWidth: "600px",
        }}
      >
        <div
          className="liquid-glass"
          style={{
            background: "rgba(0, 0, 0, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "1.5rem",
            padding: "2rem",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "start" }}>
            {/* Icon */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Cookie size={24} color="white" />
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.75rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "white",
                    margin: 0,
                  }}
                >
                  Cookie & Privacy
                </h3>
                <Shield size={16} color="#667eea" />
              </div>

              <p
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(255, 255, 255, 0.7)",
                  lineHeight: "1.6",
                  margin: "0 0 1.5rem 0",
                }}
              >
                Utilizziamo cookie essenziali per autenticare il tuo account in
                modo sicuro. I cookie sono <strong>HTTP-only</strong> e protetti
                contro XSS. Nessun dato viene condiviso con terze parti.
              </p>

              {/* Buttons */}
              <div
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
              >
                <button
                  onClick={handleAccept}
                  className="btn-primary"
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "50px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Check size={16} />
                  Accetta Cookie
                </button>
                <button
                  onClick={handleReject}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "50px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.7)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.1)";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.05)";
                    e.target.style.color = "rgba(255, 255, 255, 0.7)";
                  }}
                >
                  <X size={16} />
                  Rifiuta
                </button>
              </div>

              <p
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255, 255, 255, 0.5)",
                  marginTop: "1rem",
                  marginBottom: 0,
                }}
              >
                Rifiutando i cookie, non potrai effettuare il login. Puoi
                modificare le tue preferenze in qualsiasi momento.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
