import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, Send, MessageSquare, CheckCircle, RefreshCw, Star } from 'lucide-react';
import axios from 'axios';

const FeedbackSection = ({ onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="flex-center" style={{ gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                        key={star} 
                        size={28} 
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        fill={(hoverRating || rating) >= star ? '#4ade80' : 'none'}
                        color={(hoverRating || rating) >= star ? '#4ade80' : 'var(--text-dim)'}
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    />
                ))}
            </div>
            <textarea
                placeholder="Lascia un commento (opzionale)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                }}
            />
            <button
                onClick={() => rating > 0 && onSubmit(rating, comment)}
                disabled={rating === 0}
                className="btn-primary"
                style={{ fontSize: '0.875rem', width: '100%', opacity: rating === 0 ? 0.5 : 1 }}
            >
                Invia Feedback
            </button>
        </div>
    );
};

const Support = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.isAdmin;
    const [tickets, setTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [newTicketSubject, setNewTicketSubject] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [lastFetch, setLastFetch] = useState(Date.now());
    const scrollRef = useRef(null);

    // Initial fetch and list update poll
    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 10000); // Poll list every 10s
        return () => clearInterval(interval);
    }, []);

    // Active ticket sync poll
    useEffect(() => {
        if (!activeTicket) return;
        const interval = setInterval(async () => {
            try {
                const res = await axios.get('/api/tickets');
                const fresh = res.data.find(t => t._id === activeTicket._id);
                if (fresh && JSON.stringify(fresh.messages) !== JSON.stringify(activeTicket.messages)) {
                    setActiveTicket(fresh);
                }
            } catch (err) {
                console.error("Sync error:", err);
            }
        }, 3000); // Poll active chat every 3s
        return () => clearInterval(interval);
    }, [activeTicket]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeTicket]);

    const fetchTickets = async () => {
        try {
            const res = await axios.get('/api/tickets');
            const data = isAdmin ? res.data : res.data.filter(t => t.userId?._id === user._id);
            setTickets(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicketSubject) return;
        try {
            const res = await axios.post('/api/tickets', {
                userId: user._id, 
                problem: newTicketSubject // backend will summarize this
            });
            setTickets([res.data, ...tickets]);
            setActiveTicket(res.data);
            setIsCreating(false);
            setNewTicketSubject('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage || !activeTicket) return;
        
        const msgData = {
            userId: user._id,
            role: isAdmin ? 'admin' : 'user',
            content: newMessage
        };
        
        try {
            const res = await axios.post(`/api/tickets/${activeTicket._id}/message`, msgData);
            setActiveTicket(res.data);
            setNewMessage('');
            // Update the ticket in the list as well
            setTickets(tickets.map(t => t._id === res.data._id ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    const closeTicket = async () => {
        if (!activeTicket || !isAdmin) return;
        try {
            const res = await axios.patch(`/api/tickets/${activeTicket._id}`, {
                status: 'closed'
            });
            setActiveTicket(res.data);
            setTickets(tickets.map(t => t._id === res.data._id ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="chat-layout">
            {/* Ticket List */}
            <div className="ticket-sidebar">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Support Loop</h3>
                    <RefreshCw size={14} style={{ opacity: 0.3, cursor: 'pointer' }} onClick={fetchTickets} />
                </div>

                {!isAdmin && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="btn-primary"
                        style={{ padding: '1rem', width: '100%', marginBottom: '1rem' }}
                    >
                        <MessageSquare size={18} /> Nuovo Ticket
                    </button>
                )}

                <div className="ticket-list">
                    {tickets.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem', padding: '2rem 1rem' }}>Siamo pronti ad aiutarti. Apri un ticket per assistenza.</p>}
                    {tickets.map(ticket => (
                        <button 
                            key={ticket._id}
                            onClick={() => { setActiveTicket(ticket); setIsCreating(false); }}
                            className={`ticket-item ${activeTicket?._id === ticket._id ? 'ticket-item-active' : ''}`}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                <p style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4 }}>
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </p>
                                <div style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    borderRadius: '50%', 
                                    background: ticket.status === 'open' ? '#4ade80' : ticket.status === 'answered' ? '#00e5ff' : 'var(--text-dim)',
                                    boxShadow: ticket.status === 'open' ? '0 0 10px #4ade80' : 'none'
                                }} />
                            </div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>{ticket.subject}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', alignItems: 'center' }}>
                                <p style={{ fontSize: '0.625rem', opacity: 0.4, fontWeight: 700, textTransform: 'uppercase' }}>
                                    {isAdmin ? (ticket.userId?.name || 'User') : ticket.status}
                                </p>
                                {ticket.status === 'answered' && !isAdmin && <span style={{ fontSize: '8px', background: '#00e5ff', color: 'black', padding: '1px 4px', borderRadius: '4px', fontWeight: 900 }}>NEW</span>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="chat-area">
                <AnimatePresence mode="wait">
                    {isCreating ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}
                        >
                            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '3rem', textAlign: 'center' }}>
                                <div style={{ width: '4rem', height: '4rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', margin: '0 auto 1.5rem', border: '1px solid var(--border-subtle)' }}>
                                    <LifeBuoy size={32} style={{ opacity: 0.5 }} />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Apri Ticket</h3>
                                <p className="text-muted text-sm mb-8">Descrivi brevemente il tuo problema o la tua richiesta.</p>
                                
                                <div className="flex-col gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Oggetto della richiesta..."
                                        value={newTicketSubject}
                                        onChange={(e) => setNewTicketSubject(e.target.value)}
                                        className="input-field"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => setIsCreating(false)} className="btn-secondary">Annulla</button>
                                        <button onClick={handleCreateTicket} className="btn-primary">Invia</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTicket ? (
                        <motion.div 
                            key={activeTicket._id}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                        >
                            <div className="chat-header">
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{activeTicket.subject}</h3>
                                    <p style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '4px' }}>
                                        {isAdmin ? `CLIENT: ${activeTicket.userId?.name || 'SCONOSCIUTO'}` : 'ASSISTENZA TECNICA'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    {isAdmin && activeTicket.status !== 'closed' && (
                                        <button 
                                            onClick={closeTicket}
                                            className="btn-secondary"
                                            style={{ 
                                                padding: '0.5rem 1rem', 
                                                fontSize: '0.65rem', 
                                                borderColor: 'rgba(239, 68, 68, 0.2)',
                                                color: '#f87171'
                                            }}
                                        >
                                            Chiudi Caso
                                        </button>
                                    )}
                                    <div className={`status-badge ${activeTicket.status === 'open' ? 'status-open' : activeTicket.status === 'answered' ? 'status-answered' : 'status-closed'}`}
                                         style={{ 
                                             background: activeTicket.status === 'open' ? 'rgba(74, 222, 128, 0.1)' : activeTicket.status === 'answered' ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                                             color: activeTicket.status === 'open' ? '#4ade80' : activeTicket.status === 'answered' ? '#00e5ff' : 'var(--text-dim)',
                                             border: '1px solid currentColor'
                                         }}
                                    >
                                        {activeTicket.status}
                                    </div>
                                </div>
                            </div>

                            <div ref={scrollRef} className="chat-messages" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem' }}>
                                {activeTicket.messages.map((msg, i) => {
                                    const isMe = isAdmin ? msg.role === 'admin' : msg.role === 'user';
                                    const senderName = msg.senderId?.name || (msg.role === 'admin' ? 'Supporto Tecnico' : 'Utente');
                                    const senderPic = msg.senderId?.picture || '/favicon.png';
                                    
                                    return (
                                        <div key={i} style={{ 
                                            display: 'flex', 
                                            flexDirection: isMe ? 'row-reverse' : 'row', 
                                            gap: '1rem', 
                                            maxWidth: '80%', 
                                            alignSelf: isMe ? 'flex-end' : 'flex-start' 
                                        }}>
                                            {/* Avatar */}
                                            <div style={{ flexShrink: 0, width: '2.5rem', height: '2.5rem', borderRadius: '50%', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                                                <img src={senderPic} alt={senderName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            
                                            {/* Message Content */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.5, marginBottom: '0.25rem', padding: '0 0.5rem' }}>{senderName}</span>
                                                <div className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-admin'}`} 
                                                     style={{ 
                                                         background: isMe ? (isAdmin ? 'rgba(0, 229, 255, 0.1)' : 'rgba(74, 222, 128, 0.1)') : 'rgba(255,255,255,0.05)',
                                                         color: 'white',
                                                         padding: '1rem',
                                                         borderRadius: '1rem',
                                                         borderTopRightRadius: isMe ? '2px' : '1rem',
                                                         borderTopLeftRadius: isMe ? '1rem' : '2px',
                                                         border: '1px solid var(--border-subtle)'
                                                     }}
                                                >
                                                    <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{msg.content}</p>
                                                </div>
                                                <div style={{ marginTop: '0.25rem', opacity: 0.3, fontSize: '0.65rem', fontWeight: 600, padding: '0 0.5rem' }}>
                                                    {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {activeTicket.status !== 'closed' ? (
                                <div className="chat-input-area">
                                    <div className="chat-input-wrapper" style={{ border: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
                                        <input 
                                            type="text" 
                                            placeholder="Digita un messaggio..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}
                                        />
                                        <button 
                                            onClick={handleSendMessage}
                                            className="btn-primary"
                                            style={{ width: 'auto', padding: '0.75rem', borderRadius: '10px' }}
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ padding: '2.5rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border-subtle)' }}>
                                    {!isAdmin && !activeTicket.rating ? (
                                        <div className="flex-col gap-4">
                                            <p style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6 }}>Valuta il supporto ricevuto:</p>
                                            <FeedbackSection 
                                                onSubmit={async (rating, comment) => {
                                                    const res = await axios.patch(`/api/tickets/${activeTicket._id}`, { 
                                                        rating, 
                                                        feedbackComment: comment 
                                                    });
                                                    setActiveTicket(res.data);
                                                    setTickets(tickets.map(t => t._id === res.data._id ? res.data : t));
                                                }}
                                            />
                                        </div>
                                    ) : activeTicket.rating ? (
                                        <div className="flex-center" style={{ gap: '0.75rem', color: '#4ade80', fontSize: '0.8rem', fontWeight: 700 }}>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[...Array(activeTicket.rating)].map((_, i) => <Star key={i} size={12} fill="#4ade80" />)}
                                            </div>
                                            Feedback Inviato
                                        </div>
                                    ) : (
                                        <div className="flex-center" style={{ gap: '0.75rem', color: 'var(--text-dim)', fontSize: '0.8rem', fontWeight: 700 }}>
                                            <CheckCircle size={16} /> CASO ARCHIVIATO
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center', opacity: 0.1 }}>
                            <MessageSquare size={80} strokeWidth={1} style={{ marginBottom: '2rem' }} />
                            <h3 className="text-2xl font-bold tracking-tight">Support Terminal</h3>
                            <p className="text-sm">Seleziona una sessione per avviare il debug assistito.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Support;
