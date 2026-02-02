import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [isSetup, setIsSetup] = useState(true); // Default to true (login mode) until checked
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('mattiaghigo60@gmail.com');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    // Base URL for API - should be env var in real app
    const API_URL = 'http://localhost:3001/api/auth';

    useEffect(() => {
        checkSetupStatus();
    }, []);

    const checkSetupStatus = async () => {
        try {
            const res = await axios.get(`${API_URL}/status`);
            setIsSetup(res.data.isSetup);
        } catch (err) {
            console.error("Error checking status", err);
            setMessage("Errore di connessione al server.");
        } finally {
            setLoading(false);
        }
    };

    const handleSetup = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Le password non coincidono.");
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/setup`, { email, password });
            setMessage(res.data.message);
            setIsSetup(true); // Switch to login mode
            setPassword('');
        } catch (err) {
            setMessage(err.response?.data?.message || "Errore durante il setup");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/login`, { email, password });
            // Store user info (mock token)
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/dashboard');
        } catch (err) {
            setMessage(err.response?.data?.message || "Credenziali non valide");
        }
    };

    if (loading) return <div className="container" style={{paddingTop: '5rem', textAlign: 'center'}}>Caricamento...</div>;

    return (
        <div className="container" style={{ paddingTop: '5rem', maxWidth: '400px' }}>
            <h1 className="title" style={{ textAlign: 'center' }}>
                {isSetup ? "Admin Login" : "Benvenuto! Crea Password"}
            </h1>

            {message && <div style={{ 
                backgroundColor: message.includes('success') ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)', 
                color: message.includes('success') ? '#4caf50' : '#f44336',
                padding: '1rem', 
                borderRadius: '5px', 
                marginBottom: '1rem',
                textAlign: 'center'
            }}>
                {message}
            </div>}

            {!isSetup ? (
                // Setup Form
                <form onSubmit={handleSetup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <p style={{ textAlign: 'center', opacity: 0.8 }}>Login iniziale per: {email}</p>
                    <input 
                        type="password" 
                        placeholder="Nuova Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff' }}
                        required
                    />
                    <input 
                        type="password" 
                        placeholder="Conferma Password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff' }}
                        required
                    />
                    <button type="submit" className="btn" style={{ width: '100%' }}>Crea Password</button>
                </form>
            ) : (
                // Login Form
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <input 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        disabled
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#777', cursor: 'not-allowed' }}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #333', background: '#222', color: '#fff' }}
                        required
                    />
                    <button type="submit" className="btn" style={{ width: '100%' }}>Accedi</button>
                </form>
            )}
        </div>
    );
};

export default Login;
