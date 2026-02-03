import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('Autenticazione in corso...');

    useEffect(() => {
        const handleDiscordCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (code) {
                try {
                    const res = await axios.post('http://localhost:3001/api/auth/discord', { code });
                    const user = res.data.user;
                    localStorage.setItem('user', JSON.stringify(user));

                    if (user.isAdmin) {
                        navigate('/dashboard');
                    } else {
                        navigate('/user-dashboard');
                    }
                } catch (err) {
                    console.error("Discord Auth Error:", err);
                    setStatus("Errore durante l'accesso con Discord. Riprova.");
                    setTimeout(() => navigate('/login'), 3000);
                }
            } else {
                navigate('/login');
            }
        };

        handleDiscordCallback();
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
