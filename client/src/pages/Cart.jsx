import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowLeft, ArrowRight, ShoppingCart, Tag, Minus, Plus, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    getSubtotal, 
    getDiscount, 
    getTotal,
    applyCoupon,
    removeCoupon,
    coupon,
    couponDetails
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const result = await applyCoupon(couponCode.trim());
    if (result.success) {
      setCouponSuccess(`Coupon applicato: -${result.discount.type === 'percentage' ? result.discount.value + '%' : '€' + result.discount.value}`);
      setCouponError('');
      setCouponCode('');
    } else {
      setCouponError(result.message);
      setCouponSuccess('');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (cart.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--bg-black)', minHeight: '100vh', color: 'white' }}>
        {/* Navbar */}
        <nav 
          className="liquid-glass"
          style={{ 
            position: 'fixed', 
            top: '1.5rem', 
            left: '50%', 
            transform: 'translateX(-50%)',
            width: '90%', 
            maxWidth: '1200px',
            padding: '1rem 2.5rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            zIndex: 100,
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, white 0%, rgba(255,255,255,0.2) 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'black'
            }}>
              <ShoppingCart size={22} />
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1.5px', textTransform: 'lowercase', color: 'white' }}>
              matty47ghigo<span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>.studios</span>
            </div>
          </Link>
          
          <Link to="/shop" className="btn-secondary" style={{ padding: '0.6rem 1.5rem', borderRadius: '50px' }}>
            <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} />
            Torna allo Shop
          </Link>
        </nav>

        {/* Empty Cart */}
        <section style={{ paddingTop: '140px', paddingBottom: '4rem', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', maxWidth: '400px', padding: '0 1.5rem' }}
          >
            <div style={{ 
              width: '120px', 
              height: '120px', 
              margin: '0 auto 2rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingCart size={48} style={{ opacity: 0.3 }} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
              Il tuo carrello è <span className="text-gradient">vuoto</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
              Non hai ancora aggiunto nessun servizio al carrello. Scopri le nostre soluzioni professionali!
            </p>
            <Link to="/shop" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2.5rem' }}>
              <ShoppingCart size={18} />
              Esplora lo Shop
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </section>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-black)', minHeight: '100vh', color: 'white' }}>
      {/* Navbar */}
      <nav 
        className="liquid-glass"
        style={{ 
          position: 'fixed', 
          top: '1.5rem', 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '90%', 
          maxWidth: '1200px',
          padding: '1rem 2.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          zIndex: 100,
          borderRadius: '100px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'linear-gradient(135deg, white 0%, rgba(255,255,255,0.2) 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'black'
          }}>
            <ShoppingCart size={22} />
          </div>
          <div style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1.5px', textTransform: 'lowercase', color: 'white' }}>
            matty47ghigo<span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>.studios</span>
          </div>
        </Link>
        
        <Link to="/shop" className="btn-secondary" style={{ padding: '0.6rem 1.5rem', borderRadius: '50px' }}>
          <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} />
          Continua lo Shopping
        </Link>
      </nav>

      {/* Content */}
      <section style={{ paddingTop: '140px', paddingBottom: '4rem' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Il tuo <span className="text-gradient">Carrello</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              {cart.length} {cart.length === 1 ? 'servizio' : 'servizi'} nel carrello
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
              {/* Cart Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <AnimatePresence>
                  {cart.map((item, index) => (
                    <motion.div
                      key={`${item._id}-${JSON.stringify(item.options)}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.1 }}
                      style={{ 
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '1.5rem',
                        padding: '1.5rem',
                        display: 'flex',
                        gap: '1.5rem',
                        alignItems: 'center'
                      }}
                    >
                      {/* Product Image */}
                      <div style={{ 
                        width: '100px', 
                        height: '100px', 
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: 'rgba(255,255,255,0.05)'
                      }}>
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingCart size={32} style={{ opacity: 0.3 }} />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '50px', 
                          background: 'rgba(255,255,255,0.02)', 
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.65rem', 
                          fontWeight: 700,
                          color: 'var(--text-dim)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '0.5rem'
                        }}>
                          {item.category}
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white' }}>
                          {item.name || item.title}
                        </h3>
                        {item.options && Object.keys(item.options).length > 0 && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                            {Object.entries(item.options).map(([key, value]) => (
                              <span key={key} style={{ marginRight: '1rem' }}>
                                {key}: <strong>{value}</strong>
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                          {formatPrice(item.onSale && item.salePrice ? item.salePrice : item.price)}
                        </div>
                      </div>

                      {/* Quantity & Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                        {/* Quantity */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: '50px',
                          padding: '0.25rem',
                        }}>
                          <button 
                            onClick={() => updateQuantity(item.id || item._id, item.quantity - 1, item.options)}
                            style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%',
                              border: 'none',
                              background: 'transparent',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Minus size={16} />
                          </button>
                          <span style={{ 
                            minWidth: '40px', 
                            textAlign: 'center', 
                            fontWeight: 700,
                            fontSize: '0.9rem'
                          }}>
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id || item._id, item.quantity + 1, item.options)}
                            style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '50%',
                              border: 'none',
                              background: 'transparent',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Remove */}
                        <button 
                          onClick={() => removeFromCart(item.id || item._id, item.options)}
                          style={{ 
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-muted)';
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Clear Cart */}
                <button 
                  onClick={clearCart}
                  className="btn-secondary"
                  style={{ 
                    alignSelf: 'flex-start',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '50px',
                    fontSize: '0.85rem'
                  }}
                >
                  <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                  Svuota Carrello
                </button>
              </div>

              {/* Order Summary */}
              <div style={{ 
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '1.5rem',
                padding: '2rem',
                position: 'sticky',
                top: '120px'
              }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  Riepilogo Ordine
                </h3>

                {/* Coupon */}
                {!coupon ? (
                  <form onSubmit={handleApplyCoupon} style={{ marginBottom: '1.5rem' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      color: 'var(--text-dim)',
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Hai un coupon?
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Inserisci codice"
                        style={{ 
                          flex: 1,
                          padding: '0.75rem 1rem',
                          borderRadius: '50px',
                          border: '1px solid var(--border-subtle)',
                          background: 'rgba(255,255,255,0.02)',
                          color: 'white',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                      <button 
                        type="submit"
                        className="btn-secondary"
                        style={{ 
                          padding: '0.75rem 1.25rem',
                          borderRadius: '50px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Tag size={16} />
                      </button>
                    </div>
                    {couponError && (
                      <div style={{ 
                        marginTop: '0.75rem', 
                        padding: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '0.5rem',
                        fontSize: '0.8rem',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <AlertCircle size={14} />
                        {couponError}
                      </div>
                    )}
                  </form>
                ) : (
                  <div style={{ 
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(0, 229, 255, 0.1)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(0, 229, 255, 0.2)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        Coupon applicato
                      </span>
                      <button 
                        onClick={removeCoupon}
                        style={{ 
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          textDecoration: 'underline'
                        }}
                      >
                        Rimuovi
                      </button>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--accent)' }}>
                      {coupon.toUpperCase()}: -{formatPrice(getDiscount())}
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div style={{ 
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotale</span>
                    <span>{formatPrice(getSubtotal())}</span>
                  </div>
                  {couponDetails && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', color: '#22c55e' }}>
                      <span>Sconto</span>
                      <span>-{formatPrice(getDiscount())}</span>
                    </div>
                  )}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    marginTop: '1rem'
                  }}>
                    <span>Totale</span>
                    <span className="text-gradient">{formatPrice(getTotal())}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button 
                  onClick={() => navigate('/checkout')}
                  className="btn-primary"
                  style={{ 
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '50px',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem'
                  }}
                >
                  Procedi al Checkout
                  <ArrowRight size={20} />
                </button>

                {/* Continue Shopping */}
                <Link 
                  to="/shop"
                  style={{ 
                    display: 'block',
                    textAlign: 'center',
                    marginTop: '1rem',
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.85rem'
                  }}
                >
                  Continua lo Shopping
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Cart;
