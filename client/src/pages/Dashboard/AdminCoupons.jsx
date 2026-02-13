import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Tag, 
    Plus, 
    Trash2, 
    Copy, 
    Check, 
    X, 
    RefreshCw,
    DollarSign,
    Percent,
    Calendar,
    AlertCircle
} from 'lucide-react';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: 10,
        duration: 'once',
        maxRedemptions: 100,
        currency: 'eur',
        minAmount: 0
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [copiedId, setCopiedId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await fetch('/api/shop/admin/coupons', {
                headers: {
                    'x-user-id': JSON.parse(localStorage.getItem('user') || '{}')._id || ''
                }
            });
            const data = await response.json();
            if (data.coupons) {
                setCoupons(data.coupons);
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            setMessage({ type: 'error', text: 'Errore nel caricamento dei coupon' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('/api/shop/admin/coupons/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': JSON.parse(localStorage.getItem('user') || '{}')._id || ''
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Coupon creato con successo su Stripe!' });
                setFormData({
                    code: '',
                    type: 'percentage',
                    value: 10,
                    duration: 'once',
                    maxRedemptions: 100,
                    currency: 'eur',
                    minAmount: 0
                });
                setShowForm(false);
                fetchCoupons();
            } else {
                setMessage({ type: 'error', text: data.error || 'Errore nella creazione del coupon' });
            }
        } catch (error) {
            console.error('Error creating coupon:', error);
            setMessage({ type: 'error', text: 'Errore nella creazione del coupon' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCoupon = async (couponId) => {
        if (!window.confirm('Sei sicuro di voler eliminare questo coupon?')) return;
        
        setDeletingId(couponId);
        try {
            const response = await fetch(`/api/shop/admin/coupons/${couponId}`, {
                method: 'DELETE',
                headers: {
                    'x-user-id': JSON.parse(localStorage.getItem('user') || '{}')._id || ''
                }
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Coupon eliminato con successo' });
                fetchCoupons();
            } else {
                setMessage({ type: 'error', text: data.error || 'Errore nell\'eliminazione del coupon' });
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            setMessage({ type: 'error', text: 'Errore nell\'eliminazione del coupon' });
        } finally {
            setDeletingId(null);
        }
    };

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, code: result });
    };

    return (
        <div style={{ padding: '2rem' }}>
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        Gestione Coupon Stripe
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Crea e gestisci i coupon per gli sconti sullo shop
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="btn-primary"
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: 'var(--accent)',
                        color: 'white',
                        fontWeight: 700,
                        boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
                        border: 'none',
                        borderRadius: '100px'
                    }}
                >
                    <Plus size={18} />
                    Nuovo Coupon
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        borderRadius: '1rem',
                        background: message.type === 'error' 
                            ? 'rgba(239, 68, 68, 0.1)' 
                            : 'rgba(34, 197, 94, 0.1)',
                        border: `1px solid ${message.type === 'error' ? '#ef4444' : '#22c55e'}`,
                        color: message.type === 'error' ? '#ef4444' : '#22c55e',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {message.type === 'error' ? <AlertCircle size={20} /> : <Check size={20} />}
                    {message.text}
                </motion.div>
            )}

            {/* Create Coupon Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        marginBottom: '2rem'
                    }}
                >
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                            Crea Nuovo Coupon
                        </h2>
                        <button
                            onClick={() => setShowForm(false)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleCreateCoupon} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* Code */}
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    Codice Coupon *
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="es: SCONTO10"
                                        required
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem 1rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            fontSize: '0.9rem',
                                            outline: 'none'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={generateRandomCode}
                                        style={{
                                            padding: '0.75rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid var(--border-subtle)',
                                            borderRadius: '0.75rem',
                                            color: 'var(--text-muted)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Type */}
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    Tipo Sconto *
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'percentage' })}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            background: formData.type === 'percentage' 
                                                ? 'rgba(0, 229, 255, 0.1)' 
                                                : 'rgba(255,255,255,0.05)',
                                            border: formData.type === 'percentage' 
                                                ? '1px solid var(--accent)' 
                                                : '1px solid var(--border-subtle)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <Percent size={18} />
                                        Percentuale
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'fixed' })}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            background: formData.type === 'fixed' 
                                                ? 'rgba(0, 229, 255, 0.1)' 
                                                : 'rgba(255,255,255,0.05)',
                                            border: formData.type === 'fixed' 
                                                ? '1px solid var(--accent)' 
                                                : '1px solid var(--border-subtle)',
                                            borderRadius: '0.75rem',
                                            color: 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <DollarSign size={18} />
                                        Fisso (€)
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* Value */}
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    {formData.type === 'percentage' ? 'Percentuale (%) *' : 'Valore (€) *'}
                                </label>
                                <input
                                    type="number"
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                                    min={formData.type === 'percentage' ? 1 : 1}
                                    max={formData.type === 'percentage' ? 100 : undefined}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Duration */}
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    Durata *
                                </label>
                                <select
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="once">Una tantum</option>
                                    <option value="repeating">Ripetente (mesi)</option>
                                    <option value="forever">Per sempre</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            {/* Max Redemptions */}
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    Max Utilizzi
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxRedemptions}
                                    onChange={(e) => setFormData({ ...formData, maxRedemptions: parseInt(e.target.value) || 0 })}
                                    min={1}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Min Amount */}
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    Min. Ordine (€)
                                </label>
                                <input
                                    type="number"
                                    value={formData.minAmount}
                                    onChange={(e) => setFormData({ ...formData, minAmount: parseFloat(e.target.value) || 0 })}
                                    min={0}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Currency */}
                            <div>
                                <label style={{ 
                                    display: 'block', 
                                    marginBottom: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    Valuta
                                </label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '0.75rem',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="eur">EUR (€)</option>
                                    <option value="usd">USD ($)</option>
                                    <option value="gbp">GBP (£)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '1rem 2rem',
                                background: 'var(--accent)',
                                border: 'none',
                                borderRadius: '100px',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: 800,
                                cursor: loading ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                marginTop: '1rem',
                                width: '100%',
                                boxShadow: '0 10px 30px rgba(0, 229, 255, 0.4)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <RefreshCw size={20} />
                                    </motion.div>
                                    Creazione in corso...
                                </>
                            ) : (
                                <>
                                    <Tag size={22} />
                                    CREA COUPON SU STRIPE
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            )}

            {/* Coupons List */}
            {loading && !coupons.length ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ display: 'inline-block', color: 'var(--text-muted)' }}
                    >
                        <RefreshCw size={32} />
                    </motion.div>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Caricamento coupon...</p>
                </div>
            ) : coupons.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '1.5rem'
                }}>
                    <Tag size={48} style={{ color: 'var(--text-dim)', marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Nessun coupon trovato
                    </h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Crea il tuo primo coupon per iniziare a offrire sconti ai clienti
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        style={{ 
                            padding: '1rem 2rem', 
                            background: 'var(--accent)', 
                            color: 'white', 
                            fontWeight: 800, 
                            border: 'none', 
                            borderRadius: '100px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            boxShadow: '0 10px 30px rgba(0, 229, 255, 0.2)'
                        }}
                    >
                        <Plus size={20} />
                        Crea il primo Coupon
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {coupons.map((coupon, index) => (
                        <motion.div
                            key={coupon.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '1rem',
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    background: 'linear-gradient(135deg, var(--accent) 0%, rgba(0,229,255,0.7) 100%)',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Tag size={28} color="white" />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'monospace' }}>
                                            {coupon.id}
                                        </h3>
                                        <button
                                            onClick={() => copyToClipboard(coupon.id, coupon.id)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                        >
                                            {copiedId === coupon.id ? <Check size={16} style={{ color: '#22c55e' }} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                        {coupon.percent_off ? `${coupon.percent_off}%` : `${coupon.amount_off / 100} ${coupon.currency.toUpperCase()}`} di sconto
                                        {coupon.max_redemptions && ` • Max ${coupon.max_redemptions} utilizzi`}
                                    </p>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Calendar size={12} />
                                            Creato: {new Date(coupon.created * 1000).toLocaleDateString('it')}
                                        </span>
                                        {coupon.times_redeemed !== undefined && (
                                            <span>
                                                Utilizzato: {coupon.times_redeemed} / {coupon.max_redemptions || '∞'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                disabled={deletingId === coupon.id}
                                style={{
                                    padding: '0.75rem',
                                    background: deletingId === coupon.id ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '0.75rem',
                                    color: deletingId === coupon.id ? '#ef4444' : 'var(--text-muted)',
                                    cursor: deletingId === coupon.id ? 'default' : 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {deletingId === coupon.id ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <RefreshCw size={18} />
                                    </motion.div>
                                ) : (
                                    <Trash2 size={18} />
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;
