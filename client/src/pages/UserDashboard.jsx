import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #050505 0%, #1a1a1a 100%)',
            color: '#fff',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <div className="liquid-glass" style={{ 
                maxWidth: '600px', 
                margin: '4rem auto', 
                padding: '3rem', 
                borderRadius: '30px' 
            }}>
                <img 
                    src={user.picture} 
                    alt="User" 
                    style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '1.5rem', border: '3px solid var(--primary)' }} 
                />
                <h1 className="title">Benvenuto, {user.name}!</h1>
                <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Questa è la tua area utente. Al momento non hai permessi amministrativi.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={() => navigate('/')} className="btn" style={{ background: 'transparent', border: '1px solid #fff' }}>Torna alla Home</button>
                    <button onClick={handleLogout} className="btn">Esci</button>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
