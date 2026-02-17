import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  X,
  ChevronRight,
  FileText,
  Download,
  AlertCircle,
} from "lucide-react";
import api from "../../utils/api";

const Orders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/shop/orders", {
          headers: { "x-user-id": user._id || user.id },
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Errore nel caricamento ordini:", err);
        setError("Errore nel caricamento degli ordini");
      } finally {
        setLoading(false);
      }
    };

    if (user._id || user.id) {
      fetchOrders();
    }
  }, [user._id, user.id]);

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "#ffc107",
        bg: "rgba(255, 193, 7, 0.1)",
        icon: <Clock size={14} />,
        label: "In Attesa",
      },
      processing: {
        color: "#0ea5e9",
        bg: "rgba(14, 165, 233, 0.1)",
        icon: <Package size={14} />,
        label: "In Corso",
      },
      completed: {
        color: "#22c55e",
        bg: "rgba(34, 197, 94, 0.1)",
        icon: <CheckCircle size={14} />,
        label: "Completato",
      },
      cancelled: {
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.1)",
        icon: <AlertCircle size={14} />,
        label: "Cancellato",
      },
    };
    return configs[status] || configs["pending"];
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMainItemImage = (items) => {
    if (items && items.length > 0) {
      return items[0].image || null;
    }
    return null;
  };

  const generatePDFReceipt = async (order) => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 229, 255); // var(--accent) approx
    doc.text("MATTY47GHIGO STUDIOS", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("mattiaghigo60@gmail.com", 20, 28);
    // Removed website URL as requested

    // Receipt info
    doc.setFontSize(10);
    doc.setTextColor(0);
    const rightAlignX = 190;
    doc.text(
      `RICEVUTA ORDINE: #${order.orderNumber || order._id?.slice(-8).toUpperCase()}`,
      rightAlignX,
      20,
      { align: "right" },
    );
    doc.text(
      `Data: ${formatDate(order.createdAt || order.date)}`,
      rightAlignX,
      28,
      { align: "right" },
    );
    doc.text(`Stato: ${order.status.toUpperCase()}`, rightAlignX, 36, {
      align: "right",
    });

    // Billing Info
    doc.setFontSize(14);
    doc.text("Dati di Fatturazione:", 20, 50);
    doc.setFontSize(11);
    doc.text(
      `${order.billingInfo?.firstName} ${order.billingInfo?.lastName}`,
      20,
      60,
    );
    doc.text(`${order.billingInfo?.email}`, 20, 67);
    if (order.billingInfo?.phone)
      doc.text(`Tel: ${order.billingInfo?.phone}`, 20, 74);
    doc.text(`${order.billingInfo?.address}`, 20, 81);
    doc.text(
      `${order.billingInfo?.postalCode}, ${order.billingInfo?.city}`,
      20,
      88,
    );
    if (order.billingInfo?.vatNumber)
      doc.text(`P.IVA: ${order.billingInfo?.vatNumber}`, 20, 95);

    // Table Items
    const tableData = order.items.map((item) => [
      item.name,
      item.quantity || 1,
      formatPrice(item.price),
      formatPrice(item.price * (item.quantity || 1)),
    ]);

    autoTable(doc, {
      startY: 105,
      head: [["Servizio", "Quantità", "Prezzo Unitario", "Totale"]],
      body: tableData,
      headStyles: { fillColor: [0, 229, 255] },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // Summary
    const summaryXLabel = 120;
    const summaryXValue = 190;
    doc.setFontSize(10);
    doc.text(`Subtotale:`, summaryXLabel, finalY);
    doc.text(
      `${formatPrice(order.subtotal || order.total + (order.discount || 0))}`,
      summaryXValue,
      finalY,
      { align: "right" },
    );

    if (order.discount > 0) {
      doc.setTextColor(34, 197, 94); // Green
      doc.text(
        `Sconto (${order.couponCode || "Coupon"}):`,
        summaryXLabel,
        finalY + 7,
      );
      doc.text(`- ${formatPrice(order.discount)}`, summaryXValue, finalY + 7, {
        align: "right",
      });
    }

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`TOTALE:`, summaryXLabel, finalY + 17);
    doc.text(`${formatPrice(order.total)}`, summaryXValue, finalY + 17, {
      align: "right",
    });

    // Footer
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(150);
    doc.text(
      "Grazie per aver scelto i servizi di Matty47ghigo Studios!",
      105,
      280,
      { align: "center" },
    );

    doc.save(`Ricevuta_${order.orderNumber || order._id}.pdf`);
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "1024px", textAlign: "center", padding: "4rem" }}>
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
              width: "48px",
              height: "48px",
              border: "3px solid var(--border-subtle)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "var(--text-muted)" }}>Caricamento ordini...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1024px" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-col gap-8"
      >
        <div>
          <h2 className="text-3xl font-bold mb-2">
            I miei <span className="text-gradient">Ordini</span>
          </h2>
          <p className="text-muted text-sm">
            Visualizza la cronologia dei tuoi acquisti e lo stato dei servizi.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "0.75rem",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="flex-col gap-4">
          <AnimatePresence>
            {orders.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card flex-col"
                style={{
                  padding: "4rem",
                  borderStyle: "dashed",
                  textAlign: "center",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "6rem",
                    height: "6rem",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <ShoppingCart size={32} style={{ opacity: 0.3 }} />
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    marginBottom: "0.5rem",
                    fontSize: "1.25rem",
                  }}
                >
                  Nessun ordine ancora
                </h3>
                <p
                  className="text-xs text-dim"
                  style={{ marginBottom: "1.5rem", maxWidth: "300px" }}
                >
                  Non hai ancora effettuato alcun acquisto. Scopri i nostri
                  servizi!
                </p>
                <Link
                  to="/shop"
                  className="btn-primary"
                  style={{ width: "auto", padding: "0.75rem 2rem" }}
                >
                  <ShoppingCart size={16} style={{ marginRight: "0.5rem" }} />
                  Esplora lo Shop
                </Link>
              </motion.div>
            ) : (
              orders.map((order, i) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <motion.div
                    key={order._id || order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.5rem",
                      flexWrap: "wrap",
                      padding: "1.5rem",
                    }}
                  >
                    {/* Product Image */}
                    <div
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        width: "5rem",
                        height: "5rem",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "1rem",
                        border: "1px solid var(--border-subtle)",
                        overflow: "hidden",
                        flexShrink: 0,
                        cursor: "pointer",
                      }}
                    >
                      {getMainItemImage(order.items) ? (
                        <img
                          src={getMainItemImage(order.items)}
                          alt="Order"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ShoppingCart size={24} style={{ opacity: 0.3 }} />
                        </div>
                      )}
                    </div>

                    {/* Order Info */}
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-dim)",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                          }}
                        >
                          #
                          {order.orderNumber ||
                            order._id?.slice(-8).toUpperCase()}
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "50px",
                            background: statusConfig.bg,
                            color: statusConfig.color,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>
                      <h4
                        style={{
                          fontWeight: 700,
                          fontSize: "1rem",
                          marginBottom: "0.5rem",
                          color: "white",
                        }}
                      >
                        {order.items?.length === 1
                          ? order.items[0].name
                          : `${order.items?.length} servizi`}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          color: "var(--text-dim)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <Clock size={14} />
                          {formatDate(order.createdAt || order.date)}
                        </span>
                        {order.couponCode && (
                          <span style={{ color: "var(--accent)" }}>
                            Coupon: {order.couponCode}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      {/* Total */}
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-dim)",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Totale
                        </p>
                        <p
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: 900,
                            color: "white",
                          }}
                        >
                          {formatPrice(order.total)}
                        </p>
                        {order.discount > 0 && (
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#22c55e",
                            }}
                          >
                            - {formatPrice(order.discount)}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="btn-secondary"
                          style={{
                            width: "auto",
                            padding: "0.75rem",
                            borderRadius: "0.75rem",
                          }}
                          title="Visualizza Dettagli"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => generatePDFReceipt(order)}
                          className="btn-secondary"
                          style={{
                            width: "auto",
                            padding: "0.75rem",
                            borderRadius: "0.75rem",
                          }}
                          title="Scarica Ricevuta"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Info Card */}
        <div
          style={{
            padding: "1.5rem",
            background: "rgba(0, 229, 255, 0.05)",
            border: "1px solid rgba(0, 229, 255, 0.1)",
            borderRadius: "1rem",
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(0, 229, 255, 0.1)",
              borderRadius: "0.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FileText size={20} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
              Hai bisogno di aiuto?
            </h4>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-muted)",
                marginBottom: "0.75rem",
              }}
            >
              Per questioni relative agli ordini, fatturazione o assistenza
              post-vendita, contatta il nostro supporto tecnico.
            </p>
            <Link
              to="/dashboard/support"
              style={{
                fontSize: "0.85rem",
                color: "var(--accent)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Apri un ticket di supporto
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1.5rem",
            }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card liquid-glass"
              style={{
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "2.5rem",
                position: "relative",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedOrder(null)}
                style={{
                  position: "absolute",
                  top: "1.5rem",
                  right: "1.5rem",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-dim)",
                  cursor: "pointer",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--text-dim)";
                }}
              >
                <X size={20} />
              </button>

              <div style={{ marginBottom: "2rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--accent)",
                      fontWeight: 800,
                    }}
                  >
                    #
                    {selectedOrder.orderNumber ||
                      selectedOrder._id?.slice(-8).toUpperCase()}
                  </span>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "50px",
                      background: getStatusConfig(selectedOrder.status).bg,
                      color: getStatusConfig(selectedOrder.status).color,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                    }}
                  >
                    {getStatusConfig(selectedOrder.status).label}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.75rem", fontWeight: 900 }}>
                  Dettagli Ordine
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                  Effettuato il{" "}
                  {formatDate(selectedOrder.createdAt || selectedOrder.date)}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {/* Billing Section */}
                <div
                  style={{
                    padding: "1.25rem",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "1rem",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <h5
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      marginBottom: "0.75rem",
                      fontWeight: 800,
                    }}
                  >
                    Dati Fatturazione
                  </h5>
                  <p style={{ fontWeight: 600 }}>
                    {selectedOrder.billingInfo?.firstName}{" "}
                    {selectedOrder.billingInfo?.lastName}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                    {selectedOrder.billingInfo?.email}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                    {selectedOrder.billingInfo?.address}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-dim)" }}>
                    {selectedOrder.billingInfo?.postalCode}{" "}
                    {selectedOrder.billingInfo?.city}
                  </p>
                  {selectedOrder.billingInfo?.vatNumber && (
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--accent)",
                        marginTop: "0.5rem",
                      }}
                    >
                      P.IVA: {selectedOrder.billingInfo?.vatNumber}
                    </p>
                  )}
                </div>

                {/* Items Section */}
                <div
                  style={{
                    padding: "1.25rem",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "1rem",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <h5
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      marginBottom: "1rem",
                      fontWeight: 800,
                    }}
                  >
                    Prodotti / Servizi
                  </h5>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                            {item.name}
                          </p>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-dim)",
                            }}
                          >
                            Quantità: {item.quantity || 1}
                          </p>
                        </div>
                        <p style={{ fontWeight: 700 }}>
                          {formatPrice(item.price * (item.quantity || 1))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Section */}
                <div
                  style={{
                    padding: "1.25rem",
                    background: "rgba(0, 229, 255, 0.03)",
                    borderRadius: "1rem",
                    border: "1px solid rgba(0, 229, 255, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}
                    >
                      Subtotale
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {formatPrice(
                        selectedOrder.subtotal ||
                          selectedOrder.total + selectedOrder.discount,
                      )}
                    </span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                        color: "#22c55e",
                      }}
                    >
                      <span style={{ fontSize: "0.9rem" }}>
                        Sconto{" "}
                        {selectedOrder.couponCode &&
                          `(${selectedOrder.couponCode})`}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        - {formatPrice(selectedOrder.discount)}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "0.75rem",
                      paddingTop: "0.75rem",
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <span style={{ fontWeight: 900, fontSize: "1.1rem" }}>
                      TOTALE
                    </span>
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: "1.1rem",
                        color: "var(--accent)",
                      }}
                    >
                      {formatPrice(selectedOrder.total)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => generatePDFReceipt(selectedOrder)}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "50px",
                  }}
                >
                  <Download size={18} style={{ marginRight: "0.5rem" }} />
                  Scarica Ricevuta PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;

