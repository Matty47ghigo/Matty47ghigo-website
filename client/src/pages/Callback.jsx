import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('Autenticazione in corso...');

    useEffect(() => {
        const handleCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const isLinking = localStorage.getItem('linking') === 'true';

            if (code) {
                try {
                    // Determine provider: check URL, localStorage, or explicit request
                    const urlParams = new URLSearchParams(window.location.search);
                    const state = urlParams.get('state'); // Some providers use state
                    let provider = isLinking ? localStorage.getItem('linking_provider') : localStorage.getItem('auth_provider');

                    // Fallback for legacy links or direct access if provider not set
                    if (!provider) {
                         // Try to detect from error messages or specific provider handling if possible,
                         // but safest is to ask user or fail clearly.
                         // Here we default to a safe check or fail.
                         console.warn("Provider not detected in localStorage, checking if GitHub...");
                         // We can try GitHub ONLY if we have strong indicators, but usually better to error out.
                         // For this fix, we'll assume if auth_provider is missing, user might have clicked a specific link.
                         // Since we can't reliably detect without state, we'll error out.
                         throw new Error("Provider non identificato. Assicurati di aver effettuato il login tramite i pulsanti del sito.");
                    }

                    console.log(`Using provider: ${provider}`);
                    const res = await axios.post(`/api/auth/${provider}`, { code });

                    // Check if 2FA is required
                    if (res.data.message === '2FA_REQUIRED') {
                        localStorage.setItem('tempUserId', res.data.userId);
                        localStorage.setItem('tempId', res.data.tempId);
                        setStatus('Verifica 2FA richiesta...');
                        navigate('/login');
                        return;
                    }

                    const user = res.data.user;
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.removeItem('linking');

                    if (isLinking) {
                        alert('Account collegato con successo!');
                        navigate('/dashboard/profile');
                    } else {
                        navigate(user.isAdmin ? '/dashboard' : '/user-dashboard');
                    }
                } catch (err) {
                    console.error("Auth Error:", err);
                    console.error("Error details:", err.response?.data || err.message);
                    const errorMsg = err.response?.data?.message || err.message || "Errore sconosciuto";
                    setStatus(`Errore: ${errorMsg}. Reindirizzamento al login...`);
                    setTimeout(() => navigate('/login'), 3000);
                }
            } else {
                navigate('/login');
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#000', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.2rem'
        }}>
            <div className="liquid-glass" style={{ padding: '2rem', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ marginBottom: '1rem' }}>🐙🎮</div>
                {status}
            </div>
        </div>
    );
};

export default Callback;
