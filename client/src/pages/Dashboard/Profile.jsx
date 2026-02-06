import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, MapPin, Globe, Github, Chrome, MessageSquare, Save, ShieldCheck, AlertCircle, Trash2, Shield, X, Copy } from 'lucide-react';
import axios from 'axios';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [is2FAEnabled, setIs2FAEnabled] = useState(user.isTwoFactorEnabled);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newSocialPassword, setNewSocialPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const isSocialUser = user.provider !== 'standard';
    
    // Address and CAP state
    const [address, setAddress] = useState(user.address || '');
    const [cap, setCap] = useState(user.cap || '');
    const [profilePicture, setProfilePicture] = useState(user.picture || '');

    const handleSave = async () => {
        try {
            const res = await axios.patch(`/api/users/${user._id}`, {
                address,
                cap,
                picture: profilePicture
            });
            const updatedUser = { ...user, address, cap, picture: profilePicture };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            alert('Profilo aggiornato con successo!');
        } catch (err) {
            alert('Errore durante il salvataggio: ' + (err.response?.data?.message || err.message));
        }
    };
    
    const handlePictureUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setProfilePicture(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // COMPLETE 2FA REWRITE
    const setup2FA = async () => {
        setLoading(true);
        try {
            console.log('Starting 2FA setup for user:', user._id);
            const response = await axios.post('/api/auth/2fa/setup', { 
                userId: user._id 
            });
            
            console.log('2FA Setup Response:', response.data);
            
            if (!response.data) {
                throw new Error('Nessuna risposta dal server');
            }
            
            if (!response.data.qrCode) {
                throw new Error('QR Code mancante nella risposta');
            }
            
            setQrCode(response.data.qrCode);
            setShow2FAModal(true);
            setVerificationCode('');
            setBackupCodes([]);
            
        } catch (error) {
            console.error('2FA Setup Error Details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            let errorMessage = 'Errore sconosciuto durante il setup 2FA';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`Errore Setup 2FA: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const verify2FA = async () => {
        // Sanitize input
        const code = verificationCode.replace(/\s/g, '');
        
        if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
            alert('Inserisci un codice valido di 6 cifre numeriche');
            return;
        }
        
        setLoading(true);
        try {
            console.log('Verifying 2FA code:', code);
            
            const response = await axios.post('/api/auth/2fa/verify', { 
                userId: user._id, 
                token: code
            });
            
            console.log('2FA Verification Response:', response.data);
            
            if (!response.data.backupCodes) {
                throw new Error('Backup codes mancanti nella risposta');
            }
            
            setBackupCodes(response.data.backupCodes);
            setIs2FAEnabled(true);
            
            const updatedUser = { 
                ...user, 
                isTwoFactorEnabled: true, 
                twoFactorBackupCodes: response.data.backupCodes 
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
        } catch (error) {
            console.error('2FA Verification Error Details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            let errorMessage = 'Codice non valido';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            alert(`Errore Verifica 2FA: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    const disable2FA = async () => {
        const password = prompt('Inserisci la password per disabilitare 2FA:');
        if (!password) return;
        try {
            await axios.post('/api/auth/2fa/disable', { userId: user._id, password });
            setIs2FAEnabled(false);
            const updatedUser = { ...user, isTwoFactorEnabled: false };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            alert('2FA Disabilitata');
        } catch (err) {
            alert('Password errata o errore server');
        }
    };

    const handleSetPassword = async () => {
        if (!newSocialPassword) return;
        try {
            const res = await axios.post('/api/auth/set-password', { 
                userId: user._id, 
                password: newSocialPassword 
            });
            alert(res.data.message);
            setShowPasswordModal(false);
            const updatedUser = { ...user, passwordHash: 'PRESENT' }; 
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (err) {
            alert('Errore impostazione password');
        }
    };

    const handleLink = (provider) => {
        const authUrls = {
            github: `https://github.com/login/oauth/authorize?client_id=Ov23liaNFwaY3610bNBP&scope=user:email&redirect_uri=http://localhost:5173/callback`,
            discord: `https://discord.com/oauth2/authorize?client_id=1468322361093914882&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback&scope=identify+email`,
            google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=573870177178-3jpnvm2uq6fejse4k2bl8c22bqu6kcad.apps.googleusercontent.com&redirect_uri=http://localhost:5173/callback&response_type=code&scope=email profile openid`
        };
        // Store linking state to handle in callback
        localStorage.setItem('linking', 'true');
        localStorage.setItem('linking_provider', provider);
        window.location.href = authUrls[provider];
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = confirm('ATTENZIONE: Questa azione è IRREVERSIBILE. Tutti i tuoi dati, ticket e ordini verranno eliminati permanentemente. Vuoi procedere?');
        if (!confirmDelete) return;

        const password = prompt('Per confermare l\'eliminazione, inserisci la tua password:');
        if (!password) return;

        try {
            const res = await axios.delete(`/api/users/${user._id}`, { data: { password } });
            alert(res.data.message);
            localStorage.removeItem('user');
            window.location.href = '/login';
        } catch (err) {
            alert('Errore: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div style={{ maxWidth: '896px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-col gap-6">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">Profilo</h2>
                    <p className="text-muted text-sm">Gestisci le tue informazioni personali e la sicurezza dell'account.</p>
                </div>

                <div className="grid grid-cols-1 md-grid-cols-2 gap-6" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)' }}>
                    {/* General Info */}
                    <div className="card flex-col gap-6">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
                            <div 
                                style={{ width: '4rem', height: '4rem', borderRadius: '50%', border: '2px solid white', padding: '0.25rem', overflow: 'hidden', cursor: 'pointer' }}
                                onClick={() => document.getElementById('profilePictureInput').click()}
                            >
                                <img src={profilePicture || user.picture || '/favicon.png'} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            </div>
                            <button 
                                onClick={() => document.getElementById('profilePictureInput').click()}
                                style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Cambia foto
                            </button>
                            <input 
                                id="profilePictureInput"
                                type="file" 
                                accept="image/*" 
                                onChange={handlePictureUpload}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className="flex-col gap-4">
                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Nome Completo</label>
                                <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                                    <User size={18} style={{ color: 'var(--text-dim)' }} />
                                    <input type="text" value={`${user.name} ${user.surname || ''}`} readOnly style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.875rem', width: '100%' }} />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: 0 }}>
                                <label className="input-label">Email</label>
                                <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '0.75rem 1rem', opacity: isSocialUser ? 0.5 : 1 }}>
                                    <Mail size={18} style={{ color: 'var(--text-dim)' }} />
                                    <input type="email" value={user.email} readOnly={isSocialUser} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.875rem', width: '100%' }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="input-group">
                                    <label className="input-label">Indirizzo</label>
                                    <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                                        <MapPin size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Via..." 
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.875rem', width: '100%' }} 
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">CAP</label>
                                    <div className="input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                                        <Globe size={18}/>
                                        <input 
                                            type="text" 
                                            placeholder="00100" 
                                            value={cap}
                                            onChange={(e) => setCap(e.target.value)}
                                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.875rem', width: '100%' }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleSave} className="btn-primary">
                            <Save size={18} /> Salva Modifiche
                        </button>
                    </div>

                    {/* Security & 2FA */}
                    <div className="flex-col gap-6">
                        <div className="card flex-col gap-4">
                            <h3 className="text-lg font-bold mb-4 flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                                <ShieldCheck size={20} style={{ color: is2FAEnabled ? '#4ade80' : 'white', opacity: 0.8 }} /> Two-Factor Auth
                            </h3>
                            <p className="text-muted" style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                                Aggiungi un ulteriore livello di sicurezza al tuo account utilizzando un'app di autenticazione (Google o Microsoft Authenticator).
                            </p>
                            
                            {is2FAEnabled ? (
                                <div style={{ background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.2)', padding: '1.25rem', borderRadius: '1rem' }}>
                                    <div className="flex-center" style={{ justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4ade80' }}>STATUS: ATTIVO</span>
                                        <button onClick={disable2FA} style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Disabilita</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={setup2FA} className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-subtle)' }}>
                                    Configura 2FA
                                </button>
                            )}
                        </div>

                        <div className="card flex-col gap-4">
                            <h3 className="text-lg font-bold mb-4 flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                                <Globe size={20} style={{ color: '#00e5ff' }} /> Account Collegati
                            </h3>
                            <div className="flex-col gap-3">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Chrome size={16} /> <span style={{ fontSize: '0.8rem' }}>Google</span>
                                    </div>
                                    {user.linkedAccounts?.google || user.provider === 'google' ? <Shield size={14} style={{ color: '#00e5ff' }} /> : <button onClick={() => handleLink('google')} style={{ fontSize: '0.65rem', background: 'none', border: 'none', color: 'var(--text-dim)', textDecoration: 'underline' }}>Collega</button>}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <Github size={16} /> <span style={{ fontSize: '0.8rem' }}>GitHub</span>
                                    </div>
                                    {user.linkedAccounts?.github || user.provider === 'github' ? <Shield size={14} style={{ color: '#00e5ff' }} /> : <button onClick={() => handleLink('github')} style={{ fontSize: '0.65rem', background: 'none', border: 'none', color: 'var(--text-dim)', textDecoration: 'underline' }}>Collega</button>}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <MessageSquare size={16} /> <span style={{ fontSize: '0.8rem' }}>Discord</span>
                                    </div>
                                    {user.linkedAccounts?.discord || user.provider === 'discord' ? <Shield size={14} style={{ color: '#00e5ff' }} /> : <button onClick={() => handleLink('discord')} style={{ fontSize: '0.65rem', background: 'none', border: 'none', color: 'var(--text-dim)', textDecoration: 'underline' }}>Collega</button>}
                                </div>
                            </div>
                            {user.provider !== 'standard' && !user.passwordHash && (
                                <button onClick={() => setShowPasswordModal(true)} className="btn-secondary" style={{ marginTop: '0.5rem', width: '100%', fontSize: '0.75rem' }}>Imposta Password Accesso</button>
                            )}
                        </div>

                        <div className="card flex-col gap-4">
                            <h3 className="text-lg font-bold mb-4 flex-center" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                                <Trash2 size={20} style={{ color: '#ef4444' }} /> Danger Zone
                            </h3>
                            <p className="text-muted" style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                                Se desideri eliminare definitivamente il tuo account e tutti i dati associati, puoi farlo qui.
                            </p>
                            <button onClick={handleDeleteAccount} className="btn-secondary" style={{ borderColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.75rem' }}>
                                Elimina Account Permanentemente
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 2FA SETUP MODAL */}
            <AnimatePresence>
                {show2FAModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="card" 
                            style={{ maxWidth: '450px', width: '100%', padding: '2.5rem', textAlign: 'center' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <h3 className="text-xl font-bold">Configura Authenticator</h3>
                                <X size={20} style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setShow2FAModal(false)} />
                            </div>

                            {backupCodes.length > 0 ? (
                                <div className="flex-col gap-6">
                                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                                        <ShieldCheck size={40} style={{ color: '#4ade80', margin: '0 auto 1rem' }} />
                                        <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Successo!</h4>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Salva questi codici di backup. Ti serviranno se perdi l'accesso all'app.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {backupCodes.map((code, idx) => (
                                            <div key={idx} style={{ background: 'black', padding: '0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>{code}</div>
                                        ))}
                                    </div>
                                    <button onClick={() => setShow2FAModal(false)} className="btn-primary">Ho salvato i codici</button>
                                </div>
                            ) : (
                                <div className="flex-col gap-6">
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scansiona il QR Code con Google Authenticator o inserisci il segreto manualmente.</p>
                                    <div style={{ padding: '1rem', background: 'white', borderRadius: '1rem', display: 'inline-block', margin: '0 auto' }}>
                                        <img src={qrCode} alt="2FA QR Code" style={{ width: '180px', height: '180px' }} />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Codice 6 cifre..." 
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        className="input-field" 
                                        style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.5em' }}
                                    />
                                    <button onClick={verify2FA} className="btn-primary">Verifica e Abilita</button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Password Modal */}
            <AnimatePresence>
                {showPasswordModal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
                            <h3 className="text-xl font-bold mb-4">Imposta Password</h3>
                            <p className="text-muted mb-6" style={{ fontSize: '0.8rem' }}>Imposta una password per poter accedere al tuo account anche tramite email.</p>
                            <input 
                                type="password" 
                                placeholder="Nuova Password..." 
                                value={newSocialPassword}
                                onChange={(e) => setNewSocialPassword(e.target.value)}
                                className="input-field" 
                                style={{ marginBottom: '1.5rem' }}
                            />
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowPasswordModal(false)} className="btn-secondary" style={{ flex: 1 }}>Annulla</button>
                                <button onClick={handleSetPassword} className="btn-primary" style={{ flex: 1 }}>Salva</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
