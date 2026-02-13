import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

const CheckoutCancel = () => {
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
                        <ArrowLeft size={22} />
                    </div>
                    <div style={{ fontWeight: 900, fontSize: '1.4rem', letterSpacing: '-1.5px', textTransform: 'lowercase', color: 'white' }}>
                        matty47ghigo<span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>.studios</span>
                    </div>
                </Link>
            </nav>

            {/* Content */}
            <section style={{ paddingTop: '140px', paddingBottom: '4rem', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
                <div className="container" style={{ maxWidth: '500px', margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
                            Pagamento <span style={{ color: '#ffc107' }}>Annullato</span>
                        </h1>
                        
                        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7 }}>
                            Il pagamento è stato annullato. Nessun addebito è stato effettuato sul tuo conto.
                        </p>

                        <div style={{ 
                            background: 'rgba(255, 193, 7, 0.1)',
                            border: '1px solid rgba(255, 193, 7, 0.2)',
                            borderRadius: '1rem',
                            padding: '1.5rem',
                            marginBottom: '2rem'
                        }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                Se hai riscontrato problemi durante il processo di pagamento, 
                                riprova o contatta il supporto per assistenza.
                            </p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Link 
                                to="/cart"
                                className="btn-primary"
                                style={{ 
                                    padding: '1rem 2.5rem', 
                                    width: 'auto',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                <ShoppingCart size={18} />
                                Torna al Carrello
                            </Link>
                            
                            <Link 
                                to="/shop"
                                className="btn-secondary"
                                style={{ 
                                    padding: '1rem 2.5rem', 
                                    width: 'auto',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                Continua lo Shopping
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default CheckoutCancel;
