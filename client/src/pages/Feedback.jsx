import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Star, CheckCircle, ArrowRight } from 'lucide-react';

const Feedback = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('pending'); // pending, submitting, success, error
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const r = searchParams.get('rating');
        if (r) setRating(Number(r));
    }, [searchParams]);

    const handleSubmit = async () => {
        const ticketId = searchParams.get('ticketId');
        if (!ticketId || !rating) return;

        setStatus('submitting');
        try {
            await axios.patch(`/api/tickets/${ticketId}`, { 
                rating, 
                feedbackComment: comment 
            });
            setStatus('success');
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card" 
                style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem' }}
            >
                {status === 'pending' || status === 'submitting' ? (
                    <>
                        <h2 className="text-2xl font-bold mb-2">Lascia un Feedback</h2>
                        <p className="text-muted mb-8">Come valuti il supporto ricevuto?</p>

                        <div className="flex-center" style={{ gap: '0.5rem', marginBottom: '2rem' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                    key={star} 
                                    size={36} 
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
                            placeholder="Vuoi aggiungere un dettaglio? (Opzionale)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: '1rem',
                                color: 'white',
                                fontSize: '1rem',
                                resize: 'vertical',
                                marginBottom: '2rem'
                            }}
                        />

                        <button 
                            onClick={handleSubmit} 
                            disabled={rating === 0 || status === 'submitting'}
                            className="btn-primary" 
                            style={{ width: '100%', padding: '1rem' }}
                        >
                            {status === 'submitting' ? 'Invio in corso...' : 'Invia Recensione'}
                        </button>
                    </>
                ) : status === 'success' ? (
                    <>
                        <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '50%', marginBottom: '1.5rem' }}>
                            <CheckCircle size={40} style={{ color: '#4ade80' }} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Grazie!</h2>
                        <p className="text-muted mb-8">Il tuo feedback è stato registrato con successo.</p>
                        <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ width: '100%' }}>
                            Vai alla Dashboard <ArrowRight size={16} />
                        </button>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: '#ef4444' }}>Errore</h2>
                        <p className="text-muted mb-8">Non è stato possibile salvare il feedback.</p>
                        <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ width: '100%' }}>
                            Torna alla Dashboard
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default Feedback;
