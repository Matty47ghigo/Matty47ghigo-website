import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, Send, MessageSquare, CheckCircle, XCircle, Star, BarChart3 } from 'lucide-react';
import axios from 'axios';

const Support = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.isAdmin;
    const [tickets, setTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [newTicketSubject, setNewTicketSubject] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeTicket]);

    const fetchTickets = async () => {
        try {
            const res = await axios.get('http://localhost:3001/api/tickets');
            // Filter if not admin
            const data = isAdmin ? res.data : res.data.filter(t => t.userId?._id === user._id);
            setTickets(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateTicket = async () => {
        if (!newTicketSubject) return;
        try {
            const res = await axios.post('http://localhost:3001/api/tickets', {
                userId: user._id,
                subject: newTicketSubject,
                messages: [{ senderId: user._id, role: 'user', content: 'Inizio conversazione' }]
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
        const msg = {
            senderId: user._id,
            role: isAdmin ? 'admin' : 'user',
            content: newMessage,
            date: new Date()
        };
        
        // In a real app, you'd send this to the server
        const updatedTicket = { ...activeTicket };
        updatedTicket.messages.push(msg);
        if (isAdmin) updatedTicket.status = 'answered';
        
        setActiveTicket({ ...updatedTicket });
        setNewMessage('');
        
        // Simulate backend update
        await axios.post('http://localhost:3001/api/messages', {
            ticketId: activeTicket._id,
            ...msg
        }).catch(err => console.error(err));
    };

    const closeTicket = async () => {
        if (!activeTicket || !isAdmin) return;
        // Mock closure
        const updated = { ...activeTicket, status: 'closed' };
        setActiveTicket(updated);
        alert('Ticket chiuso. L\'utente riceverà l\'email per il feedback.');
    };

    return (
        <div className="h-[calc(100vh-12rem)] flex gap-6">
            {/* Ticket List */}
            <div className="w-80 flex flex-col gap-4">
                {!isAdmin && (
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="w-full bg-primary text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.2)] active:scale-95 transition-all"
                    >
                        <MessageSquare size={18} /> Nuovo Ticket
                    </button>
                )}

                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                    {tickets.length === 0 && <p className="text-center text-gray-500 py-10 text-xs text-white">Nessun ticket disponibile</p>}
                    {tickets.map(ticket => (
                        <button 
                            key={ticket._id}
                            onClick={() => { setActiveTicket(ticket); setIsCreating(false); }}
                            className={`w-full text-left p-4 rounded-2xl border transition-all ${
                                activeTicket?._id === ticket._id 
                                ? 'bg-primary/20 border-primary text-white' 
                                : 'bg-white/5 border-white/10 hover:border-white/20 text-gray-400'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </p>
                                <span className={`w-2 h-2 rounded-full ${ticket.status === 'open' ? 'bg-green-500' : 'bg-gray-500'}`} />
                            </div>
                            <p className="font-bold truncate text-sm">{ticket.subject}</p>
                            <p className="text-[10px] text-gray-500 mt-1 truncate">
                                {isAdmin ? `Utente: ${ticket.userId?.name || 'Sconosciuto'}` : 'Click per dettagli'}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col">
                <AnimatePresence mode="wait">
                    {isCreating ? (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                                <LifeBuoy size={40} />
                            </div>
                            <h3 className="text-2xl font-black mb-2">Nuova Richiesta</h3>
                            <div className="w-full max-w-md space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Oggetto del ticket..."
                                    value={newTicketSubject}
                                    onChange={(e) => setNewTicketSubject(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 outline-none focus:border-primary/50 text-center text-white"
                                />
                                <div className="flex gap-4">
                                    <button onClick={() => setIsCreating(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold transition-all text-white">Annulla</button>
                                    <button onClick={handleCreateTicket} className="flex-1 bg-primary text-black py-4 rounded-2xl font-bold transition-all">Apri Ticket</button>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTicket ? (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h3 className="font-bold text-white">{activeTicket.subject}</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Utente: {activeTicket.userId?.name || user.name}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {isAdmin && activeTicket.status !== 'closed' && (
                                        <button 
                                            onClick={closeTicket}
                                            className="px-4 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            Chiudi Ticket
                                        </button>
                                    )}
                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        activeTicket.status === 'open' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                                    }`}>
                                        {activeTicket.status}
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                                {activeTicket.messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-5 rounded-3xl ${
                                            msg.role === 'user' 
                                            ? 'bg-primary text-black font-medium rounded-tr-none shadow-[0_4px_15px_rgba(0,229,255,0.2)]' 
                                            : 'bg-white/10 border border-white/10 text-white rounded-tl-none'
                                        }`}>
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                            <p className={`text-[9px] mt-2 font-bold uppercase opacity-50 ${msg.role === 'user' ? 'text-black' : 'text-gray-400'}`}>
                                                {msg.role.toUpperCase()} • {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input */}
                            {activeTicket.status !== 'closed' ? (
                                <div className="p-6 bg-white/[0.02] border-t border-white/10 text-white">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center gap-2 group focus-within:border-primary/50 transition-all">
                                        <input 
                                            type="text" 
                                            placeholder="Scrivi una risposta..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                            className="flex-1 bg-transparent px-4 outline-none text-sm py-2"
                                        />
                                        <button 
                                            onClick={handleSendMessage}
                                            className="p-3 bg-primary text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-white/5 text-center text-gray-500 text-xs italic text-white">
                                    Questa conversazione è stata chiusa.
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30 text-white">
                            <MessageSquare size={64} className="mb-4" />
                            <h3 className="text-xl font-bold">Inbox Assistenza</h3>
                            <p className="text-sm">Seleziona un ticket per vedere i dettagli.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Support;
