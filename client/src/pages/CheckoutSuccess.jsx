import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, ShoppingCart, Download } from "lucide-react";
import axios from "axios";
import { useCart } from "../context/CartContext";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { clearCart } = useCart();

  useEffect(() => {
    const verifyOrder = async () => {
      const sessionId = searchParams.get("session_id");
      const orderId = searchParams.get("order_id");

      if (sessionId && orderId) {
        try {
          const res = await axios.get(
            `/api/shop/checkout/verify-session/${sessionId}`,
          );
          setOrder(res.data);
          clearCart();
        } catch (error) {
          console.error("Error verifying order:", error);
        }
      }
      setLoading(false);
    };

    verifyOrder();
  }, [searchParams]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(price / 100);
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-black)",
        minHeight: "100vh",
        color: "white",
      }}
    >
      {/* Navbar */}
      <nav
        className="liquid-glass"
        style={{
          position: "fixed",
          top: "1.5rem",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "1200px",
          padding: "1rem 2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
          borderRadius: "100px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background:
                "linear-gradient(135deg, white 0%, rgba(255,255,255,0.2) 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "black",
            }}
          >
            <CheckCircle size={22} />
          </div>
          <div
            style={{
              fontWeight: 900,
              fontSize: "1.4rem",
              letterSpacing: "-1.5px",
              textTransform: "lowercase",
              color: "white",
            }}
          >
            matty47ghigo
            <span style={{ color: "var(--text-dim)", fontWeight: 500 }}>
              .studios
            </span>
          </div>
        </Link>

        <Link
          to="/shop"
          className="btn-secondary"
          style={{ padding: "0.6rem 1.5rem", borderRadius: "50px" }}
        >
          Torna allo Shop
        </Link>
      </nav>

      {/* Content */}
      <section
        style={{
          paddingTop: "140px",
          paddingBottom: "4rem",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "0 1.5rem",
            textAlign: "center",
          }}
        >
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  border: "3px solid var(--border-subtle)",
                  borderTopColor: "var(--accent)",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: "var(--text-muted)" }}>
                Verifica ordine in corso...
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                style={{
                  width: "100px",
                  height: "100px",
                  margin: "0 auto 2rem",
                  background:
                    "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 20px 60px rgba(34, 197, 94, 0.3)",
                }}
              >
                <CheckCircle size={50} color="white" />
              </motion.div>

              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  marginBottom: "1rem",
                }}
              >
                Pagamento <span style={{ color: "#22c55e" }}>Completato!</span>
              </h1>

              <p
                style={{
                  fontSize: "1.1rem",
                  color: "var(--text-muted)",
                  marginBottom: "2rem",
                  lineHeight: 1.7,
                }}
              >
                Grazie per il tuo acquisto! Il tuo ordine è stato elaborato con
                successo. Riceverai una email di conferma con tutti i dettagli.
              </p>

              {/* Order Details */}
              {order && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "1.5rem",
                    padding: "1.5rem",
                    marginBottom: "2rem",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>Email</span>
                    <span style={{ fontWeight: 600 }}>
                      {order.customerEmail}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>Totale</span>
                    <span style={{ fontWeight: 700, color: "var(--accent)" }}>
                      {formatPrice(order.amountTotal)}
                    </span>
                  </div>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "var(--text-muted)" }}>Stato</span>
                    <span
                      style={{
                        fontWeight: 600,
                        color: order.status === "paid" ? "#22c55e" : "#ffc107",
                      }}
                    >
                      {order.status === "paid" ? "Pagato" : "In attesa"}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <Link
                  to="/dashboard/orders"
                  className="btn-primary"
                  style={{
                    padding: "1rem 2.5rem",
                    width: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <ShoppingCart size={18} />
                  Visualizza i tuoi Ordini
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/dashboard"
                  className="btn-secondary"
                  style={{
                    padding: "1rem 2.5rem",
                    width: "auto",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  Vai alla Dashboard
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CheckoutSuccess;
