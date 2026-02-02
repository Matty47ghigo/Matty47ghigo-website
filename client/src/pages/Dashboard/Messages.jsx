import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MessageSquare, Send } from 'lucide-react';

const Messages = () => {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:3001/api/messages')
            .then(res => setMessages(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
            <h2><MessageSquare /> Messaggi</h2>
            <div style={{ flex: 1, overflowY: 'auto', marginTop: '1rem', background: '#1a1a1a', borderRadius: '10px', padding: '1rem' }}>
                {messages.length === 0 ? <p>Nessun messaggio.</p> : (
                    messages.map(msg => (
                        <div key={msg.id} style={{ 
                            borderBottom: '1px solid #333', 
                            padding: '1rem', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '0.5rem',
                            opacity: msg.read ? 0.7 : 1
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{msg.sender}</strong>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(msg.date).toLocaleDateString()}</span>
                            </div>
                            <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{msg.email}</p>
                            <p>{msg.content}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button className="btn" style={{ fontSize: '0.8rem', padding: '5px 10px' }}>
                                    <Send size={14} style={{ marginRight: '5px' }}/> Rispondi
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Messages;
