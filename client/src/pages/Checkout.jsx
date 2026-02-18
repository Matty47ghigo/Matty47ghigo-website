import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  User,
  CreditCard,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Github,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Send,
} from "lucide-react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getSubtotal, getDiscount, getTotal, couponDetails } = useCart();

  const [step, setStep] = useState("auth"); // auth, billing, payment
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // login, register
  const [authProvider, setAuthProvider] = useState(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");

  const [billingInfo, setBillingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Italy",
    vatNumber: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if user is already logged in
  React.useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setStep("billing");
      const userData = JSON.parse(user);
      setBillingInfo((prev) => ({
        ...prev,
        firstName: userData.name?.split(" ")[0] || "",
        lastName: userData.name?.split(" ").slice(1).join(" ") || "",
        email: userData.email || "",
      }));
    }
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });

      if (res.data.message === "2FA_REQUIRED") {
        localStorage.setItem("tempUserId", res.data.userId);
        localStorage.setItem("tempId", res.data.tempId);
        navigate("/login");
        return;
      }

      localStorage.setItem("user", JSON.stringify(res.data.user));
      setStep("billing");
    } catch (err) {
      setError(err.response?.data?.message || "Errore durante il login");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (registerPassword !== registerConfirmPassword) {
      setError("Le password non coincidono");
      setLoading(false);
      return;
    }

    if (registerPassword.length < 8) {
      setError("La password deve essere di almeno 8 caratteri");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/register", {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });

      localStorage.setItem("user", JSON.stringify(res.data.user));
      setStep("billing");
      setBillingInfo((prev) => ({ ...prev, email: registerEmail }));
    } catch (err) {
      setError(
        err.response?.data?.message || "Errore durante la registrazione",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = () => {
    localStorage.setItem("auth_provider", "github");
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = window.location.origin + "/callback";
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const handleDiscordLogin = () => {
    localStorage.setItem("auth_provider", "discord");
    window.location.href =
      "https://discord.com/oauth2/authorize?client_id=1468322361093914882&response_type=code&redirect_uri=https%3A%2F%2Fmatty47ghigo-studios.vercel.app%2Fcallback&scope=identify+email+connections";
  };

  const handleTelegramLogin = async (user) => {
    localStorage.setItem("auth_provider", "telegram");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/telegram`,
        {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          auth_date: user.auth_date,
          hash: user.hash,
        },
        { withCredentials: true },
      );
      if (response.data.success) {
        setStep("billing");
      }
    } catch (error) {
      console.error("Telegram login error:", error);
    }
  };

  // Listen for Telegram OAuth postMessage
  React.useEffect(() => {
    const handleTelegramMessage = (event) => {
      if (event.origin !== "https://oauth.telegram.org") return;
      if (event.data && event.data.event === "auth_result") {
        const user = event.data.result;
        if (user) {
          handleTelegramLogin(user);
        }
      }
    };
    window.addEventListener("message", handleTelegramMessage);
    return () => {
      window.removeEventListener("message", handleTelegramMessage);
    };
  }, []);

  const handleBillingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate required fields
      if (
        !billingInfo.firstName ||
        !billingInfo.lastName ||
        !billingInfo.email ||
        !billingInfo.address ||
        !billingInfo.city ||
        !billingInfo.postalCode
      ) {
        setError("Compila tutti i campi obbligatori");
        setLoading(false);
        return;
      }

      setStep("payment");
    } catch (err) {
      setError(err.response?.data?.message || "Errore durante la validazione");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || (!user._id && !user.id)) {
        setError("Devi effettuare l'accesso per completare l'ordine");
        setLoading(false);
        return;
      }

      // Check if any item is a subscription
      const hasSubscription = cart.some((item) => item.isSubscription);

      const orderData = {
        userId: user._id || user.id,
        items: cart.map((item) => ({
          productId: item.id || item._id,
          name: item.name,
          price: item.onSale && item.salePrice ? item.salePrice : item.price,
          quantity: item.quantity || 1,
          image: item.image,
          options: item.options || {},
        })),
        billingInfo: {
          ...billingInfo,
          fullName: `${billingInfo.firstName} ${billingInfo.lastName}`,
        },
        subtotal: getSubtotal(),
        discount: getDiscount(),
        total: getTotal(),
        couponCode: couponDetails?.code || null,
        stripePromotionCode: couponDetails?.stripeId || null,
      };

      // Create Stripe checkout session
      let sessionRes;

      if (hasSubscription) {
        // Get billing period from first subscription item
        const subscriptionItem = cart.find((item) => item.isSubscription);
        const billingPeriod =
          subscriptionItem?.options?.billingPeriod || "month";

        sessionRes = await axios.post(
          "/api/shop/checkout/create-subscription",
          {
            ...orderData,
            billingPeriod,
          },
        );
      } else {
        sessionRes = await axios.post("/api/shop/checkout/create-session", {
          ...orderData,
        });
      }

      // Redirect to Stripe checkout
      if (sessionRes.data.url) {
        window.location.href = sessionRes.data.url;
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Errore durante il pagamento",
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "var(--bg-black)",
          minHeight: "100vh",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Il carrello è vuoto
          </h2>
          <Link
            to="/shop"
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <ShoppingCart size={18} />
            Torna allo Shop
          </Link>
        </div>
      </div>
    );
  }

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
            <CreditCard size={22} />
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
          to="/cart"
          className="btn-secondary"
          style={{ padding: "0.6rem 1.5rem", borderRadius: "50px" }}
        >
          <ArrowLeft size={18} style={{ marginRight: "0.5rem" }} />
          Torna al Carrello
        </Link>
      </nav>

      {/* Progress Steps */}
      <div
        style={{
          paddingTop: "120px",
          paddingBottom: "2rem",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div
          className="container"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            {["Autenticazione", "Fatturazione", "Pagamento"].map(
              (label, index) => {
                const currentIndex = ["auth", "billing", "payment"].indexOf(
                  step,
                );
                const isActive = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <React.Fragment key={label}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        opacity: isActive ? 1 : 0.4,
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: isActive
                            ? "var(--accent)"
                            : "rgba(255,255,255,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: isActive ? "black" : "white",
                        }}
                      >
                        {index < currentIndex ? (
                          <CheckCircle size={16} />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        style={{
                          fontWeight: isCurrent ? 700 : 500,
                          fontSize: "0.9rem",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                    {index < 2 && (
                      <div
                        style={{
                          width: "60px",
                          height: "2px",
                          background:
                            index < currentIndex
                              ? "var(--accent)"
                              : "rgba(255,255,255,0.1)",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <section style={{ paddingBottom: "4rem" }}>
        <div
          className="container"
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}
        >
          <div
            className="checkout-layout"
            style={{
              display: "grid",
              gap: "3rem",
              alignItems: "start",
            }}
          >
            {/* Main Form */}
            <div>
              <AnimatePresence mode="wait">
                {/* Auth Step */}
                {step === "auth" && (
                  <motion.div
                    key="auth"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "1.5rem",
                        padding: "2rem",
                      }}
                    >
                      <div
                        className="auth-tabs"
                        style={{
                          display: "flex",
                          gap: "2rem",
                          marginBottom: "2rem",
                        }}
                      >
                        <button
                          onClick={() => {
                            setAuthMode("login");
                            setAuthProvider(null);
                          }}
                          style={{
                            background:
                              authMode === "login"
                                ? "rgba(255,255,255,0.1)"
                                : "transparent",
                            border: "none",
                            color: "white",
                            padding: "1rem 2rem",
                            borderRadius: "1rem",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Accedi
                        </button>
                        <button
                          onClick={() => {
                            setAuthMode("register");
                            setAuthProvider(null);
                          }}
                          style={{
                            background:
                              authMode === "register"
                                ? "rgba(255,255,255,0.1)"
                                : "transparent",
                            border: "none",
                            color: "white",
                            padding: "1rem 2rem",
                            borderRadius: "1rem",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          Registrati
                        </button>
                      </div>

                      {/* OAuth Buttons */}
                      <div
                        className="oauth-buttons"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "1rem",
                          marginBottom: "2rem",
                        }}
                      >
                        <button
                          onClick={handleGitHubLogin}
                          className="btn-social"
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          <Github size={18} />
                          Continua con GitHub
                        </button>
                        <button
                          onClick={handleDiscordLogin}
                          className="btn-social"
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          <MessageSquare size={18} />
                          Continua con Discord
                        </button>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          marginBottom: "2rem",
                          color: "var(--text-muted)",
                          fontSize: "0.85rem",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: "1px",
                            background: "var(--border-subtle)",
                          }}
                        />
                        OPPURE
                        <div
                          style={{
                            flex: 1,
                            height: "1px",
                            background: "var(--border-subtle)",
                          }}
                        />
                      </div>

                      {/* Error/Success Messages */}
                      {error && (
                        <div
                          style={{
                            padding: "1rem",
                            background: "rgba(239, 68, 68, 0.1)",
                            borderRadius: "0.75rem",
                            color: "#ef4444",
                            marginBottom: "1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <AlertCircle size={18} />
                          {error}
                        </div>
                      )}

                      {success && (
                        <div
                          style={{
                            padding: "1rem",
                            background: "rgba(34, 197, 94, 0.1)",
                            borderRadius: "0.75rem",
                            color: "#22c55e",
                            marginBottom: "1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <CheckCircle size={18} />
                          {success}
                        </div>
                      )}

                      {/* Login Form */}
                      {authMode === "login" && (
                        <form
                          onSubmit={handleLogin}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.25rem",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              Email
                            </label>
                            <input
                              type="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              placeholder="nome@esempio.com"
                              style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "1rem",
                                border: "1px solid var(--border-subtle)",
                                background: "rgba(255,255,255,0.02)",
                                color: "white",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                              required
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              Password
                            </label>
                            <div style={{ position: "relative" }}>
                              <input
                                type={showPassword ? "text" : "password"}
                                value={loginPassword}
                                onChange={(e) =>
                                  setLoginPassword(e.target.value)
                                }
                                placeholder="••••••••"
                                style={{
                                  width: "100%",
                                  padding: "1rem",
                                  paddingRight: "3rem",
                                  borderRadius: "1rem",
                                  border: "1px solid var(--border-subtle)",
                                  background: "rgba(255,255,255,0.02)",
                                  color: "white",
                                  fontSize: "1rem",
                                  outline: "none",
                                  boxSizing: "border-box",
                                }}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                  position: "absolute",
                                  right: "1rem",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--text-muted)",
                                  cursor: "pointer",
                                }}
                              >
                                {showPassword ? (
                                  <EyeOff size={18} />
                                ) : (
                                  <Eye size={18} />
                                )}
                              </button>
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="btn-primary"
                            style={{
                              width: "100%",
                              padding: "1rem",
                              borderRadius: "50px",
                              marginTop: "0.5rem",
                            }}
                            disabled={loading}
                          >
                            {loading ? "Accesso in corso..." : "Accedi"}
                          </button>
                          <Link
                            to="/forgot-password"
                            style={{
                              textAlign: "center",
                              color: "var(--text-muted)",
                              textDecoration: "none",
                              fontSize: "0.85rem",
                            }}
                          >
                            Password dimenticata?
                          </Link>
                        </form>
                      )}

                      {/* Register Form */}
                      {authMode === "register" && (
                        <form
                          onSubmit={handleRegister}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "1.25rem",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              Nome Completo
                            </label>
                            <input
                              type="text"
                              value={registerName}
                              onChange={(e) => setRegisterName(e.target.value)}
                              placeholder="Mario Rossi"
                              style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "1rem",
                                border: "1px solid var(--border-subtle)",
                                background: "rgba(255,255,255,0.02)",
                                color: "white",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                              required
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              Email
                            </label>
                            <input
                              type="email"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              placeholder="nome@esempio.com"
                              style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "1rem",
                                border: "1px solid var(--border-subtle)",
                                background: "rgba(255,255,255,0.02)",
                                color: "white",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                              required
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              Password
                            </label>
                            <input
                              type="password"
                              value={registerPassword}
                              onChange={(e) =>
                                setRegisterPassword(e.target.value)
                              }
                              placeholder="Minimo 8 caratteri"
                              style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "1rem",
                                border: "1px solid var(--border-subtle)",
                                background: "rgba(255,255,255,0.02)",
                                color: "white",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                              required
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              Conferma Password
                            </label>
                            <input
                              type="password"
                              value={registerConfirmPassword}
                              onChange={(e) =>
                                setRegisterConfirmPassword(e.target.value)
                              }
                              placeholder="••••••••"
                              style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "1rem",
                                border: "1px solid var(--border-subtle)",
                                background: "rgba(255,255,255,0.02)",
                                color: "white",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="btn-primary"
                            style={{
                              width: "100%",
                              padding: "1rem",
                              borderRadius: "50px",
                              marginTop: "0.5rem",
                            }}
                            disabled={loading}
                          >
                            {loading
                              ? "Registrazione in corso..."
                              : "Crea Account"}
                          </button>
                        </form>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Billing Step */}
                {step === "billing" && (
                  <motion.div
                    key="billing"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div
                      className="billing-form-card"
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "1.5rem",
                        padding: "2rem",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 700,
                          marginBottom: "1.5rem",
                        }}
                      >
                        Informazioni di Fatturazione
                      </h2>

                      {error && (
                        <div
                          style={{
                            padding: "1rem",
                            background: "rgba(239, 68, 68, 0.1)",
                            borderRadius: "0.75rem",
                            color: "#ef4444",
                            marginBottom: "1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <AlertCircle size={18} />
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleBillingSubmit}>
                        <div
                          className="form-grid-2"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1rem",
                            marginBottom: "1.5rem",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              Nome *
                            </label>
                            <input
                              type="text"
                              value={billingInfo.firstName}
                              onChange={(e) =>
                                setBillingInfo({
                                  ...billingInfo,
                                  firstName: e.target.value,
                                })
                              }
                              placeholder="Mario"
                              style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "1rem",
                                border: "1px solid var(--border-subtle)",
                                background: "rgba(255,255,255,0.02)",
                                color: "white",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                              required
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              Cognome *
                            </label>
                            <input
                              type="text"
                              value={billingInfo.lastName}
                              onChange={(e) =>
                                setBillingInfo({
                                  ...billingInfo,
                                  lastName: e.target.value,
                                })
                              }
                              placeholder="Rossi"
                              style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "1rem",
                                border: "1px solid var(--border-subtle)",
                                background: "rgba(255,255,255,0.02)",
                                color: "white",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                              required
                            />
                          </div>
                        </div>

                        <div
                          className="form-grid-2"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1rem",
                            marginBottom: "1.5rem",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              Email *
                            </label>
                            <input
                              type="email"
                              value={billingInfo.email}
                              onChange={(e) =>
                                setBillingInfo({
                                  ...billingInfo,
                                  email: e.target.value,
                                })
                              }
                              placeholder="nome@esempio.com"
                              style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "1rem",
                                border: "1px solid var(--border-subtle)",
                                background: "rgba(255,255,255,0.02)",
                                color: "white",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                              required
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              Telefono
                            </label>
                            <input
                              type="tel"
                              value={billingInfo.phone}
                              onChange={(e) =>
                                setBillingInfo({
                                  ...billingInfo,
                                  phone: e.target.value,
                                })
                              }
                              placeholder="+39 123 456 7890"
                              style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "1rem",
                                border: "1px solid var(--border-subtle)",
                                background: "rgba(255,255,255,0.02)",
                                color: "white",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            Ragione Sociale (opzionale)
                          </label>
                          <input
                            type="text"
                            value={billingInfo.company}
                            onChange={(e) =>
                              setBillingInfo({
                                ...billingInfo,
                                company: e.target.value,
                              })
                            }
                            placeholder="Nome azienda"
                            style={{
                              width: "100%",
                              padding: "1rem",
                              borderRadius: "1rem",
                              border: "1px solid var(--border-subtle)",
                              background: "rgba(255,255,255,0.02)",
                              color: "white",
                              fontSize: "1rem",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            Indirizzo *
                          </label>
                          <input
                            type="text"
                            value={billingInfo.address}
                            onChange={(e) =>
                              setBillingInfo({
                                ...billingInfo,
                                address: e.target.value,
                              })
                            }
                            placeholder="Via Roma 123"
                            style={{
                              width: "100%",
                              padding: "1rem",
                              borderRadius: "1rem",
                              border: "1px solid var(--border-subtle)",
                              background: "rgba(255,255,255,0.02)",
                              color: "white",
                              fontSize: "1rem",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                            required
                          />
                        </div>

                        <div
                          className="form-grid-city"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr",
                            gap: "1rem",
                            marginBottom: "1.5rem",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              Città *
                            </label>
                            <input
                              type="text"
                              value={billingInfo.city}
                              onChange={(e) =>
                                setBillingInfo({
                                  ...billingInfo,
                                  city: e.target.value,
                                })
                              }
                              placeholder="Milano"
                              style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "1rem",
                                border: "1px solid var(--border-subtle)",
                                background: "rgba(255,255,255,0.02)",
                                color: "white",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                              required
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              CAP *
                            </label>
                            <input
                              type="text"
                              value={billingInfo.postalCode}
                              onChange={(e) =>
                                setBillingInfo({
                                  ...billingInfo,
                                  postalCode: e.target.value,
                                })
                              }
                              placeholder="20100"
                              style={{
                                width: "100%",
                                padding: "1rem",
                                borderRadius: "1rem",
                                border: "1px solid var(--border-subtle)",
                                background: "rgba(255,255,255,0.02)",
                                color: "white",
                                fontSize: "1rem",
                                outline: "none",
                                boxSizing: "border-box",
                              }}
                              required
                            />
                          </div>
                        </div>

                        <div style={{ marginBottom: "1.5rem" }}>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            Partita IVA (opzionale)
                          </label>
                          <input
                            type="text"
                            value={billingInfo.vatNumber}
                            onChange={(e) =>
                              setBillingInfo({
                                ...billingInfo,
                                vatNumber: e.target.value,
                              })
                            }
                            placeholder="IT12345678901"
                            style={{
                              width: "100%",
                              padding: "1rem",
                              borderRadius: "1rem",
                              border: "1px solid var(--border-subtle)",
                              background: "rgba(255,255,255,0.02)",
                              color: "white",
                              fontSize: "1rem",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            marginTop: "2rem",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setStep("auth")}
                            className="btn-secondary"
                            style={{
                              padding: "1rem 2rem",
                              borderRadius: "50px",
                            }}
                          >
                            <ArrowLeft
                              size={18}
                              style={{ marginRight: "0.5rem" }}
                            />
                            Indietro
                          </button>
                          <button
                            type="submit"
                            className="btn-primary"
                            style={{
                              flex: 1,
                              padding: "1rem",
                              borderRadius: "50px",
                            }}
                            disabled={loading}
                          >
                            Continua con il Pagamento
                            <ArrowRight
                              size={18}
                              style={{ marginLeft: "0.5rem" }}
                            />
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* Payment Step */}
                {step === "payment" && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div
                      style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "1.5rem",
                        padding: "2rem",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 700,
                          marginBottom: "1.5rem",
                        }}
                      >
                        Metodo di Pagamento
                      </h2>

                      {error && (
                        <div
                          style={{
                            padding: "1rem",
                            background: "rgba(239, 68, 68, 0.1)",
                            borderRadius: "0.75rem",
                            color: "#ef4444",
                            marginBottom: "1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <AlertCircle size={18} />
                          {error}
                        </div>
                      )}

                      {success && (
                        <div
                          style={{
                            padding: "1rem",
                            background: "rgba(34, 197, 94, 0.1)",
                            borderRadius: "0.75rem",
                            color: "#22c55e",
                            marginBottom: "1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <CheckCircle size={18} />
                          {success}
                        </div>
                      )}

                      <div
                        className="payment-methods"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "1rem",
                          marginBottom: "2rem",
                        }}
                      >
                        <button
                          onClick={() => setPaymentMethod("stripe")}
                          className="payment-method"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "1.25rem",
                            borderRadius: "1rem",
                            border:
                              paymentMethod === "stripe"
                                ? "2px solid var(--accent)"
                                : "1px solid var(--border-subtle)",
                            background:
                              paymentMethod === "stripe"
                                ? "rgba(0, 229, 255, 0.05)"
                                : "transparent",
                            color: "white",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "32px",
                              background:
                                "linear-gradient(135deg, #635bff 0%, #a259ff 100%)",
                              borderRadius: "0.5rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CreditCard size={20} color="white" />
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                marginBottom: "0.25rem",
                              }}
                            >
                              Stripe
                            </div>
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              Carte di credito, debito e prepagate
                            </div>
                          </div>
                          {paymentMethod === "stripe" && (
                            <CheckCircle
                              size={20}
                              style={{
                                marginLeft: "auto",
                                color: "var(--accent)",
                              }}
                            />
                          )}
                        </button>

                        <button
                          onClick={() => setPaymentMethod("paypal")}
                          className="payment-method"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "1.25rem",
                            borderRadius: "1rem",
                            border:
                              paymentMethod === "paypal"
                                ? "2px solid #003087"
                                : "1px solid var(--border-subtle)",
                            background:
                              paymentMethod === "paypal"
                                ? "rgba(0, 48, 135, 0.1)"
                                : "transparent",
                            color: "white",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "32px",
                              background:
                                "linear-gradient(135deg, #003087 0%, #009cde 100%)",
                              borderRadius: "0.5rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "0.7rem",
                            }}
                          >
                            PayPal
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                marginBottom: "0.25rem",
                              }}
                            >
                              PayPal
                            </div>
                            <div
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              Paga con il tuo account PayPal
                            </div>
                          </div>
                          {paymentMethod === "paypal" && (
                            <CheckCircle
                              size={20}
                              style={{ marginLeft: "auto", color: "#009cde" }}
                            />
                          )}
                        </button>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          marginTop: "2rem",
                        }}
                      >
                        <button
                          onClick={() => setStep("billing")}
                          className="btn-secondary"
                          style={{
                            padding: "1rem 2rem",
                            borderRadius: "50px",
                          }}
                        >
                          <ArrowLeft
                            size={18}
                            style={{ marginRight: "0.5rem" }}
                          />
                          Indietro
                        </button>

                        {paymentMethod === "stripe" || getTotal() === 0 ? (
                          <button
                            onClick={handlePayment}
                            className="btn-primary"
                            style={{
                              flex: 1,
                              padding: "1rem",
                              borderRadius: "50px",
                            }}
                            disabled={loading}
                          >
                            {loading ? (
                              "Elaborazione in corso..."
                            ) : (
                              <>
                                <Lock
                                  size={16}
                                  style={{ marginRight: "0.5rem" }}
                                />
                                {getTotal() === 0
                                  ? "Conferma Ordine Gratuito"
                                  : `Paga ${formatPrice(getTotal())}`}
                              </>
                            )}
                          </button>
                        ) : (
                          <div style={{ flex: 1 }}>
                            <PayPalScriptProvider
                              options={{
                                "client-id":
                                  "BAAtQZpxPji1elECclueKHUDCZjmMK8dJu0CCfHKP7I-rud-xeIDyWP06suiXQTZKDbeMCW_LZFOOoMVh0",
                                currency: "EUR",
                              }}
                            >
                              <PayPalButtons
                                style={{ layout: "horizontal", height: 48 }}
                                disabled={loading}
                                createOrder={async () => {
                                  try {
                                    const user = JSON.parse(
                                      localStorage.getItem("user"),
                                    );
                                    const orderData = {
                                      userId: user._id || user.id,
                                      items: cart.map((item) => ({
                                        productId: item.id || item._id,
                                        name: item.name,
                                        price:
                                          item.onSale && item.salePrice
                                            ? item.salePrice
                                            : item.price,
                                        quantity: item.quantity || 1,
                                        image: item.image,
                                        options: item.options || {},
                                      })),
                                      billingInfo: {
                                        ...billingInfo,
                                        fullName: `${billingInfo.firstName} ${billingInfo.lastName}`,
                                      },
                                      discount: getDiscount(),
                                    };

                                    const res = await axios.post(
                                      "/api/shop/paypal/create-order",
                                      orderData,
                                    );
                                    return res.data.id;
                                  } catch (err) {
                                    console.error("PayPal create error:", err);
                                    setError("Errore creazione ordine PayPal");
                                    return null;
                                  }
                                }}
                                onApprove={async (data, actions) => {
                                  try {
                                    setLoading(true);
                                    const { orderId } = await axios.post(
                                      "/api/shop/paypal/capture-order",
                                      {
                                        paypalOrderId: data.orderID,
                                        orderId: (
                                          await axios.get(
                                            `/api/shop/orders/by-payment/${data.orderID}`,
                                          )
                                        ).data.orderId, // Need to find our internal ID
                                      },
                                    );
                                    navigate(
                                      `/checkout/success?order_id=${orderId}&method=paypal`,
                                    );
                                  } catch (err) {
                                    console.error("PayPal capture error:", err);
                                    setError(
                                      "Errore finalizzazione pagamento PayPal",
                                    );
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                                onError={(err) => {
                                  console.error("PayPal Button error:", err);
                                  setError("Errore servizio PayPal");
                                }}
                              />
                            </PayPalScriptProvider>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div
              className="order-summary checkout-sidebar"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "1.5rem",
                padding: "2rem",
                position: "sticky",
                top: "120px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                }}
              >
                Riepilogo Ordine
              </h3>

              {/* Cart Items */}
              <div style={{ marginBottom: "1.5rem" }}>
                {cart.map((item) => (
                  <div
                    key={`${item._id}-${JSON.stringify(item.options)}`}
                    style={{
                      display: "flex",
                      gap: "1rem",
                      padding: "1rem 0",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "0.75rem",
                        overflow: "hidden",
                        background: "rgba(255,255,255,0.05)",
                        flexShrink: 0,
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
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
                          <ShoppingCart size={20} style={{ opacity: 0.3 }} />
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                      {formatPrice(
                        (item.onSale && item.salePrice
                          ? item.salePrice
                          : item.price) * item.quantity,
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <span>Subtotale</span>
                  <span>{formatPrice(getSubtotal())}</span>
                </div>
                {couponDetails && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.75rem",
                      color: "#22c55e",
                    }}
                  >
                    <span>Sconto ({couponDetails.code})</span>
                    <span>-{formatPrice(getDiscount())}</span>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginTop: "1rem",
                  }}
                >
                  <span>Totale</span>
                  <span className="text-gradient">
                    {formatPrice(getTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Checkout;
