import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronRight,
  User,
  Mail,
  Calendar,
  DollarSign,
  Eye,
  RefreshCw,
  CreditCard,
} from "lucide-react";
import axios from "axios";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/shop/admin/orders");
      setOrders(res.data);

      // Calculate stats
      const newStats = res.data.reduce(
        (acc, order) => {
          acc.total += 1;
          acc[order.status] = (acc[order.status] || 0) + 1;
          acc.totalRevenue += order.total || 0;
          return acc;
        },
        { total: 0, pending: 0, processing: 0, completed: 0, totalRevenue: 0 },
      );
      setStats(newStats);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/shop/orders/${orderId}/status`, {
        status: newStatus,
      });
      fetchOrders(); // Refresh data
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Errore durante l'aggiornamento dell'ordine");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(price);
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
        icon: <XCircle size={14} />,
        label: "Cancellato",
      },
    };
    return configs[status] || configs["pending"];
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.billingInfo?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.billingInfo?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.items?.some((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ maxWidth: "1400px" }}>
        <div
          className="flex-center"
          style={{ height: "60vh", color: "var(--text-dim)" }}
        >
          <p>Caricamento ordini...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1400px" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ marginBottom: "2rem" }}>
          <h2 className="text-3xl font-bold mb-2">
            Gestione <span className="text-gradient">Ordini</span>
          </h2>
          <p className="text-muted text-sm">
            Visualizza e gestisci tutti gli ordini dello shop.
          </p>
        </div>

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <div className="card text-center" style={{ padding: "1.25rem" }}>
            <p className="text-xs text-dim font-bold uppercase tracking-widest mb-1">
              Totale
            </p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div
            className="card text-center"
            style={{ padding: "1.25rem", borderColor: "#ffc107" }}
          >
            <p
              className="text-xs"
              style={{
                color: "#ffc107",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              In Attesa
            </p>
            <p className="text-2xl font-bold" style={{ color: "#ffc107" }}>
              {stats.pending || 0}
            </p>
          </div>
          <div
            className="card text-center"
            style={{ padding: "1.25rem", borderColor: "#0ea5e9" }}
          >
            <p
              className="text-xs"
              style={{
                color: "#0ea5e9",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              In Corso
            </p>
            <p className="text-2xl font-bold" style={{ color: "#0ea5e9" }}>
              {stats.processing || 0}
            </p>
          </div>
          <div
            className="card text-center"
            style={{ padding: "1.25rem", borderColor: "#22c55e" }}
          >
            <p
              className="text-xs"
              style={{
                color: "#22c55e",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Completati
            </p>
            <p className="text-2xl font-bold" style={{ color: "#22c55e" }}>
              {stats.completed || 0}
            </p>
          </div>
          <div className="card text-center" style={{ padding: "1.25rem" }}>
            <p className="text-xs text-dim font-bold uppercase tracking-widest mb-1">
              Fatturato
            </p>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--accent)" }}
            >
              {formatPrice(stats.totalRevenue)}
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "50px",
              padding: "0.25rem",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {["all", "pending", "processing", "completed", "cancelled"].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "50px",
                    border: "none",
                    background:
                      filter === f ? "rgba(255,255,255,0.1)" : "transparent",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                >
                  {f === "all" ? "Tutti" : getStatusConfig(f).label}
                </button>
              ),
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flex: 1,
              minWidth: "250px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "50px",
              padding: "0.5rem 1rem",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Search size={18} style={{ opacity: 0.4 }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca per ordine, cliente o servizio..."
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          <button
            onClick={fetchOrders}
            className="btn-secondary"
            style={{ padding: "0.75rem 1rem", borderRadius: "50px" }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Orders Table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Ordine
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Cliente
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Servizi
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Metodo
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Stato
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Totale
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "right",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Data
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-dim)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        padding: "3rem",
                        textAlign: "center",
                        color: "var(--text-muted)",
                      }}
                    >
                      Nessun ordine trovato
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr
                        key={order._id}
                        style={{
                          borderBottom: "1px solid var(--border-subtle)",
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td style={{ padding: "1rem" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                            #
                            {order.orderNumber?.slice(-8).toUpperCase() ||
                              order._id?.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <div>
                            <div
                              style={{ fontWeight: 600, fontSize: "0.9rem" }}
                            >
                              {order.billingInfo?.fullName ||
                                `${order.billingInfo?.firstName || ""} ${order.billingInfo?.lastName || ""}`}
                            </div>
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {order.billingInfo?.email}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ maxWidth: "200px" }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                marginBottom: "0.25rem",
                              }}
                            >
                              {order.items?.length === 1
                                ? order.items[0].name
                                : `${order.items?.length} servizi`}
                            </div>
                            {order.items?.length > 1 && (
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {order.items
                                  .slice(0, 2)
                                  .map((i) => i.name)
                                  .join(", ")}
                                {order.items.length > 2 &&
                                  ` +${order.items.length - 2}`}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          {order.paymentMethod === "paypal" ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "4px",
                                background: "rgba(0, 48, 135, 0.1)",
                                color: "#003087",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              <span style={{ fontSize: "1rem" }}>🅿️</span>{" "}
                              PayPal
                            </span>
                          ) : order.paymentMethod === "stripe" ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "4px",
                                background: "rgba(99, 91, 255, 0.1)",
                                color: "#635bff",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                              }}
                            >
                              <CreditCard size={14} /> Stripe
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {order.paymentMethod || "-"}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              padding: "0.35rem 0.75rem",
                              borderRadius: "50px",
                              background: statusConfig.bg,
                              color: statusConfig.color,
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "right",
                            fontWeight: 700,
                            fontSize: "1rem",
                          }}
                        >
                          {formatPrice(order.total)}
                        </td>
                        <td
                          style={{
                            padding: "1rem",
                            textAlign: "right",
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {formatDate(order.createdAt || order.date)}
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "none",
                              padding: "0.5rem",
                              borderRadius: "0.5rem",
                              cursor: "pointer",
                              color: "white",
                            }}
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 200,
              padding: "1rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--bg-black)",
                borderRadius: "1.5rem",
                maxWidth: "700px",
                width: "100%",
                maxHeight: "90vh",
                overflow: "auto",
                border: "1px solid var(--border-subtle)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "1.5rem",
                  borderBottom: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "sticky",
                  top: 0,
                  background: "var(--bg-black)",
                  zIndex: 10,
                }}
              >
                <div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                    Ordine #
                    {selectedOrder.orderNumber ||
                      selectedOrder._id?.slice(-8).toUpperCase()}
                  </h3>
                  <p
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  >
                    Creato il{" "}
                    {formatDate(selectedOrder.createdAt || selectedOrder.date)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    padding: "0.5rem",
                  }}
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Content */}
              <div style={{ padding: "1.5rem" }}>
                {/* Status Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "1.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  {["pending", "processing", "completed", "cancelled"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() =>
                          updateOrderStatus(selectedOrder._id, status)
                        }
                        disabled={selectedOrder.status === status}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "50px",
                          border: "none",
                          background:
                            selectedOrder.status === status
                              ? getStatusConfig(status).bg
                              : "rgba(255,255,255,0.05)",
                          color:
                            selectedOrder.status === status
                              ? getStatusConfig(status).color
                              : "var(--text-muted)",
                          cursor:
                            selectedOrder.status === status
                              ? "default"
                              : "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          opacity: selectedOrder.status === status ? 1 : 0.6,
                        }}
                      >
                        {getStatusConfig(status).label}
                      </button>
                    ),
                  )}
                </div>

                {/* Customer Info */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--text-dim)",
                      marginBottom: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Informazioni Cliente
                  </h4>
                  <div className="card" style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Nome
                        </p>
                        <p style={{ fontWeight: 600 }}>
                          {selectedOrder.billingInfo?.fullName ||
                            `${selectedOrder.billingInfo?.firstName || ""} ${selectedOrder.billingInfo?.lastName || ""}`}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Email
                        </p>
                        <p style={{ fontWeight: 600 }}>
                          {selectedOrder.billingInfo?.email}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Telefono
                        </p>
                        <p style={{ fontWeight: 600 }}>
                          {selectedOrder.billingInfo?.phone || "-"}
                        </p>
                      </div>
                      {selectedOrder.billingInfo?.company && (
                        <div>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                              marginBottom: "0.25rem",
                            }}
                          >
                            Azienda
                          </p>
                          <p style={{ fontWeight: 600 }}>
                            {selectedOrder.billingInfo.company}
                          </p>
                        </div>
                      )}
                      <div>
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Indirizzo
                        </p>
                        <p style={{ fontWeight: 600 }}>
                          {selectedOrder.billingInfo?.address},{" "}
                          {selectedOrder.billingInfo?.postalCode}{" "}
                          {selectedOrder.billingInfo?.city}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "var(--text-dim)",
                      marginBottom: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Servizi Ordinati
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    {selectedOrder.items?.map((item, i) => (
                      <div
                        key={i}
                        className="card"
                        style={{
                          padding: "1rem",
                          display: "flex",
                          gap: "1rem",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "0.75rem",
                            overflow: "hidden",
                            background: "rgba(255,255,255,0.05)",
                            flexShrink: 0,
                          }}
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p
                            style={{ fontWeight: 600, marginBottom: "0.25rem" }}
                          >
                            {item.name}
                          </p>
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--text-muted)",
                            }}
                          >
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p style={{ fontWeight: 700 }}>
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="card" style={{ padding: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "var(--text-muted)",
                      }}
                    >
                      <span>Subtotale</span>
                      <span>
                        {formatPrice(
                          selectedOrder.subtotal || selectedOrder.total,
                        )}
                      </span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "#22c55e",
                        }}
                      >
                        <span>
                          Sconto{" "}
                          {selectedOrder.couponCode &&
                            `(${selectedOrder.couponCode})`}
                        </span>
                        <span>-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        paddingTop: "0.75rem",
                        borderTop: "1px solid var(--border-subtle)",
                      }}
                    >
                      <span>Totale</span>
                      <span style={{ color: "var(--accent)" }}>
                        {formatPrice(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
