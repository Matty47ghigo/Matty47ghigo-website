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
          bottom: "1rem",
          left: "0.5rem",
          right: "0.5rem",
          zIndex: 9999,
        }}
      >
        <div
          className="liquid-glass"
          style={{
            background: "rgba(0, 0, 0, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "1rem",
            padding: "1rem",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Mobile-friendly layout */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {/* Header with icon */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Cookie size={18} color="white" />
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "white",
                    margin: 0,
                  }}
                >
                  Cookie & Privacy
                </h3>
                <Shield size={14} color="#667eea" />
              </div>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: "0.8rem",
                color: "rgba(255, 255, 255, 0.7)",
                lineHeight: "1.5",
                margin: 0,
              }}
            >
              Utilizziamo cookie essenziali per autenticare il tuo account in
              modo sicuro. I cookie sono <strong>HTTP-only</strong> e protetti
              contro XSS.
            </p>

            {/* Buttons - Stack on mobile */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={handleAccept}
                className="btn-primary"
                style={{
                  padding: "0.6rem 1rem",
                  borderRadius: "50px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  flex: 1,
                  justifyContent: "center",
                  minWidth: "120px",
                }}
              >
                <Check size={14} />
                Accetta
              </button>
              <button
                onClick={handleReject}
                style={{
                  padding: "0.6rem 1rem",
                  borderRadius: "50px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.7)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  flex: 1,
                  justifyContent: "center",
                  minWidth: "120px",
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
                <X size={14} />
                Rifiuta
              </button>
            </div>

            <p
              style={{
                fontSize: "0.7rem",
                color: "rgba(255, 255, 255, 0.5)",
                margin: 0,
              }}
            >
              Rifiutando i cookie, non potrai effettuare il login.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieConsent;
