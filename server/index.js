const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { User, Ticket, Order, Stats, AdminConfig, getAdminStatus, incrementVisitors } = require('./db');
const { sendVerificationEmail, sendTicketClosedEmail, sendAdminNotification, send2FACodeEmail } = require('./email');
const { authenticator } = require('otplib');

// Configure authenticator for better compatibility
// window: 1 allows for 1 step tolerance (previous and current time step)
// This helps if server clock is slightly off from client
try {
    authenticator.options = {
        window: 1,
        step: 30
    };
} catch (e) {
    console.warn('Impossibile configurare authenticator.options:', e.message);
}
const QRCode = require('qrcode');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// --- Middleware ---
app.use(async (req, res, next) => {
    if (req.path.startsWith('/api')) {
        const isLogged = req.headers.authorization || req.headers['x-user-id']; // Simple heuristic
        await incrementVisitors(!!isLogged);
    }
    next();
});

// --- Auth Routes ---

// Debug route for time sync (essential for TOTP)
app.get('/api/auth/time', (req, res) => {
    res.json({ 
        serverTime: Date.now(), 
        timeOffset: new Date().getTimezoneOffset() 
    });
});

// Standard Registration

app.get('/api/auth/status', async (req, res) => {
    try {
        const config = await getAdminStatus();
        res.json({ isSetup: config.isSetup });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// Standard Registration
app.post('/api/auth/register', async (req, res) => {
    const { name, surname, email, password, address, cap } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email già registrata" });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = await User.create({
            name,
            surname,
            email,
            passwordHash,
            address,
            cap,
            verificationToken,
            provider: 'standard'
        });

        await sendVerificationEmail(email, name, verificationToken);

        res.json({ message: "Registrazione completata! Controlla la tua email per attivare l'account." });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ message: "Errore durante la registrazione" });
    }
});

// Email Verification
app.get('/api/auth/verify', async (req, res) => {
    const { token } = req.query;
    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) return res.status(400).json({ message: "Token non valido o scaduto" });

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.send(`
            <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                <h1 style="color: #00e5ff;">Account Attivato! 🚀</h1>
                <p>Il tuo account è stato verificato con successo. Ora puoi chiudere questa pagina e accedere al sito.</p>
                <a href="http://localhost:5173/login" style="display: inline-block; padding: 10px 20px; background: #00e5ff; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">Accedi a Matty47ghigo</a>
            </div>
        `);
    } catch (error) {
        res.status(500).send("Errore durante la verifica");
    }
});

// Login (Standard)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: "Credenziali non valide" });

        if (user.provider === 'standard') {
            if (!user.isVerified) return res.status(403).json({ message: "Si prega di verificare l'email prima di accedere" });
            
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) return res.status(401).json({ message: "Credenziali non valide" });
        } else {
            return res.status(400).json({ message: `Questo account è collegato tramite ${user.provider}. Usa il login social.` });
        }

        const result = await handleTwoFactorCheck(user);
        if (result.requires2FA) {
            return res.json({ 
                message: "2FA_REQUIRED", 
                userId: result.userId,
                tempId: result.tempId
            });
        }

        res.json({ message: "Login effettuato", user: result.user });
    } catch (error) {
        res.status(500).json({ message: "Errore interno" });
    }
});

// 2FA Login Verification
app.post('/api/auth/2fa/login-verify', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });

        // Check if it's a backup code
        const isBackup = user.twoFactorBackupCodes.includes(token.toUpperCase());
        const isTOTP = user.twoFactorSecret ? authenticator.check(token, user.twoFactorSecret) : false;
        const isEmailCode = user.tempAuthCode === token && user.tempAuthCodeExpires > Date.now();

        if (!isBackup && !isTOTP && !isEmailCode) {
            return res.status(401).json({ message: "Codice di sicurezza non valido o scaduto" });
        }

        if (isBackup) {
            user.twoFactorBackupCodes = user.twoFactorBackupCodes.filter(c => c !== token.toUpperCase());
        }
        
        // Clear temp email code if used
        user.tempAuthCode = undefined;
        user.tempAuthCodeExpires = undefined;
        await user.save();

        res.json({ message: "Login effettuato", user });
    } catch (error) {
        res.status(500).json({ message: "Errore durante la verifica del login 2FA" });
    }
});

// Helper function to handle 2FA check after login
const handleTwoFactorCheck = async (user) => {
    // Update last login
    user.lastLogin = new Date();
    await user.save();

    if (user.isTwoFactorEnabled) {
        return {
            requires2FA: true,
            userId: user._id,
            tempId: crypto.randomBytes(16).toString('hex')
        };
    }

    return { requires2FA: false, user };
};

// Social Auth Upsert Helper
const upsertSocialUser = async (profile) => {
    const isAdmin = profile.email === 'mattiaghigo60@gmail.com';
    
    // Find user by email
    let user = await User.findOne({ email: profile.email });
    
    if (user) {
        // If user exists, ensure they are verified and update their profile picture/last login
        user.isVerified = true;
        user.lastLogin = new Date();
        user.isAdmin = isAdmin; // Update admin status based on email
        user.picture = profile.picture || user.picture;
        
        // Add to linked accounts if not already there
        if (!user.linkedAccounts) user.linkedAccounts = {};
        user.linkedAccounts[profile.provider] = profile.externalId || 'linked';
        
        // If this is a primary login (not a linking action), we might update the default provider
        // but normally we keep the first one or the most recent.
        await user.save();
        return user;
    }

    // New user
    const newUser = await User.create({ 
        name: profile.name,
        surname: profile.surname || '',
        email: profile.email,
        picture: profile.picture,
        provider: profile.provider,
        linkedAccounts: { [profile.provider]: profile.externalId || 'linked' },
        isAdmin: isAdmin,
        isVerified: true,
        lastLogin: new Date()
    });
    return newUser;
};

// Set Password for Social Users
app.post('/api/auth/set-password', async (req, res) => {
    const { userId, password } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(password, salt);
        await user.save();

        res.json({ message: "Password impostata correttamente. Ora puoi accedere anche via email." });
    } catch (error) {
        res.status(500).json({ message: "Errore durante il salvataggio della password" });
    }
});

// Forgot Password Request
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        // Security: Don't reveal if user exists. Just say email sent.
        if (!user) {
            return res.json({ message: "Se l'email esiste, riceverai un link per il reset." });
        }

        if (user.provider !== 'standard' && !user.passwordHash) {
             return res.json({ message: "Questo account utilizza il login social. Accedi con Google/Discord/GitHub." });
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const { sendPasswordResetEmail } = require('./email');
        await sendPasswordResetEmail(user.email, user.name, token);

        res.json({ message: "Se l'email esiste, riceverai un link per il reset." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Errore durante l'elaborazione della richiesta" });
    }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Link di reset non valido o scaduto." });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password aggiornata con successo! Ora puoi accedere." });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Errore durante il reset della password" });
    }
});

// Link Social Account
app.post('/api/auth/link/:provider', async (req, res) => {
    const { userId, externalId } = req.body;
    const { provider } = req.params;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });

        if (!user.linkedAccounts) user.linkedAccounts = {};
        user.linkedAccounts[provider] = externalId;
        await user.save();

        res.json({ message: `Account ${provider} collegato con successo!` });
    } catch (error) {
        res.status(500).json({ message: "Errore durante il collegamento account" });
    }
});

// Google Auth
app.post('/api/auth/google', async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const user = await upsertSocialUser({
            name: payload.given_name || payload.name,
            surname: payload.family_name || '',
            email: payload.email,
            picture: payload.picture,
            provider: 'google',
            externalId: payload.sub
        });

        const result = await handleTwoFactorCheck(user);
        if (result.requires2FA) {
            return res.json({ 
                message: "2FA_REQUIRED", 
                userId: result.userId,
                tempId: result.tempId
            });
        }

        res.json({ message: "Google login successful", user: result.user });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ message: "Invalid Google token or authentication failed." });
    }
});

// GitHub Auth
app.post('/api/auth/github', async (req, res) => {
    const { code } = req.body;
    try {
        const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, { headers: { Accept: 'application/json' } });

        const accessToken = tokenRes.data.access_token;
        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
        });

        // GitHub name is often just a single string
        const fullName = userRes.data.name || userRes.data.login;
        const nameParts = fullName.split(' ');

        const user = await upsertSocialUser({
            name: nameParts[0],
            surname: nameParts.slice(1).join(' '),
            email: userRes.data.email,
            picture: userRes.data.avatar_url,
            provider: 'github',
            externalId: userRes.data.id.toString()
        });

        const result = await handleTwoFactorCheck(user);
        if (result.requires2FA) {
            return res.json({ 
                message: "2FA_REQUIRED", 
                userId: result.userId,
                tempId: result.tempId
            });
        }

        res.json({ message: "GitHub login successful", user: result.user });
    } catch (error) {
        console.error("GitHub Auth Error:", error.response?.data || error.message);
        const errorMsg = error.response?.data?.error_description || error.response?.data?.message || "Errore GitHub";
        res.status(500).json({ message: `Errore GitHub: ${errorMsg}` });
    }
});

// Discord Auth
app.post('/api/auth/discord', async (req, res) => {
    const { code } = req.body;
    try {
        const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'http://localhost:5173/callback'
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
        });

        if (!userRes.data.email) {
             return res.status(400).json({ message: "Impossibile ottenere l'email da Discord. Assicurati di aver verificato l'email sul tuo account Discord." });
        }

        const user = await upsertSocialUser({
            name: userRes.data.global_name || userRes.data.username,
            surname: '',
            email: userRes.data.email,
            picture: `https://cdn.discordapp.com/avatars/${userRes.data.id}/${userRes.data.avatar}.png`,
            provider: 'discord',
            externalId: userRes.data.id
        });

        const result = await handleTwoFactorCheck(user);
        if (result.requires2FA) {
            return res.json({ 
                message: "2FA_REQUIRED", 
                userId: result.userId,
                tempId: result.tempId
            });
        }

        res.json({ message: "Discord login successful", user: result.user });
    } catch (error) {
        console.error("Discord Auth Error:", error.response?.data || error.message);
        res.status(500).json({ message: `Errore Discord: ${error.response?.data?.message || error.message}` });
    }
});

// --- Platform Helpers ---

const summarizeText = (text) => {
    // Advanced AI-like summarization
    const keywords = ['errore', 'problema', 'bug', 'crash', 'pagamento', 'account', 'login', 'email', 'ticket', 'ordine', 'impossibile', 'non funziona', 'aiuto', 'domanda'];
    
    // Clean text and extract potential topic
    const cleanText = text.replace(/[^\w\s]/gi, '').toLowerCase();
    let foundKeyword = keywords.find(k => cleanText.includes(k));
    
    let summary = '';
    
    if (foundKeyword) {
        summary += foundKeyword.charAt(0).toUpperCase() + foundKeyword.slice(1);
    } else {
        summary = 'Assistenza';
    }

    // Add context from first few words if readable
    const words = text.split(' ').filter(w => w.length > 3).slice(0, 3).join(' ');
    if (words && !summary.includes(words)) {
        summary += `: ${words}...`;
    } else {
        const firstSentence = text.split(/[.!?]/)[0];
        summary += `: ${firstSentence.substring(0, 30)}${firstSentence.length > 30 ? '...' : ''}`;
    }
    
    return summary;
};

// --- Platform Routes ---

app.get('/api/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('userId')
            .populate('messages.senderId', 'name picture') // Populate sender info
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tickets" });
    }
});

app.post('/api/tickets', async (req, res) => {
    const { userId, problem } = req.body;
    try {
        const subject = summarizeText(problem);
        const ticket = await Ticket.create({
            userId,
            subject,
            messages: [{
                senderId: userId,
                role: 'user',
                content: problem,
                date: new Date()
            }]
        });
        
        await ticket.populate('messages.senderId', 'name picture'); // Populate for immediate return
        
        const user = await User.findById(userId);
        await sendAdminNotification(user.name, subject, problem, ticket._id);
        res.json(ticket);
    } catch (error) {
        console.error("Ticket init error:", error);
        res.status(500).json({ message: "Error creating ticket" });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('userId').sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders" });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ lastLogin: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

app.patch('/api/users/:id/role', async (req, res) => {
    const { isAdmin } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isAdmin }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Errore aggiornamento ruolo" });
    }
});

app.patch('/api/users/:id/ban', async (req, res) => {
    const { isBanned } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isBanned }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Errore ban utente" });
    }
});

// --- Ticket Messaging & Status ---

app.post('/api/tickets/:id/message', async (req, res) => {
    const { userId, content, role } = req.body;
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        ticket.messages.push({
            senderId: userId,
            role,
            content,
            date: new Date()
        });
        
        if (role === 'user') {
            ticket.status = 'open';
        } else if (role === 'admin') {
            ticket.status = 'answered';
        }

        await ticket.save();
        await ticket.populate('messages.senderId', 'name picture'); // Populate for return

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: "Error adding message" });
    }
});

app.patch('/api/tickets/:id', async (req, res) => {
    const { status, rating, feedbackComment } = req.body;
    try {
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket non trovato" });

        if (status) ticket.status = status;
        if (rating) ticket.rating = rating;
        if (feedbackComment !== undefined) ticket.feedbackComment = feedbackComment;

        await ticket.save();
        await ticket.populate('messages.senderId', 'name picture'); // Populate for return
        
        if (status === 'closed') {
            const user = await User.findById(ticket.userId);
            if (user && user.email) {
                await sendTicketClosedEmail(user.email, user.name, ticket._id);
            }
        }

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: "Errore durante l'aggiornamento del ticket" });
    }
});

// Get Recent Feedback (for admin dashboard)
app.get('/api/feedback/recent', async (req, res) => {
    try {
        const feedbackTickets = await Ticket.find({ 
            rating: { $ne: null },
            feedbackComment: { $ne: null, $ne: '' }
        })
        .populate('userId', 'name picture')
        .sort({ createdAt: -1 })
        .limit(5);
        
        res.json(feedbackTickets);
    } catch (error) {
        console.error("Feedback fetch error:", error);
        res.status(500).json({ message: "Errore caricamento feedback" });
    }
});

// Get User Orders
app.get('/api/users/:id/orders', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.id }).sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Orders fetch error:", error);
        res.status(500).json({ message: "Errore caricamento ordini" });
    }
});

// --- User Payments ---
app.get('/api/users/:id/payments', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });
        res.json(user.paymentMethods || []);
    } catch (error) {
        res.status(500).json({ message: "Errore caricamento pagamenti" });
    }
});

app.post('/api/users/:id/payments', async (req, res) => {
    const { type, last4, brand } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });
        
        const newMethod = { type, last4, brand };
        user.paymentMethods.push(newMethod);
        await user.save();
        res.json(user.paymentMethods);
    } catch (error) {
        res.status(500).json({ message: "Errore aggiunta pagamento" });
    }
});

app.delete('/api/users/:id/payments/:paymentId', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });
        
        user.paymentMethods = user.paymentMethods.filter(m => m._id.toString() !== req.params.paymentId);
        await user.save();
        res.json(user.paymentMethods);
    } catch (error) {
        res.status(500).json({ message: "Errore eliminazione pagamento" });
    }
});

// --- Admin Utility ---

app.post('/api/admin/reset', async (req, res) => {
    const { password } = req.body;
    // Simple safety check: match admin setup or env password (in a real app this would use JWT auth)
    if (password !== 'Matty47ghigo231747#!') {
        return res.status(401).json({ message: "Autorizzazione negata" });
    }

    try {
        await Ticket.deleteMany({});
        await Order.deleteMany({});
        
        // Reset stats
        let stats = await Stats.findOne();
        if (stats) {
            stats.visitors = 0;
            stats.registeredUsers = await User.countDocuments();
            stats.orders = 0;
            stats.lastUpdated = new Date();
            await stats.save();
        }

        res.json({ message: "Database resettato con successo (Ticket e Ordini eliminati)" });
    } catch (error) {
        console.error("Reset error:", error);
        res.status(500).json({ message: "Errore durante il reset del database" });
    }
});

// --- Enhanced Danger Zone & Security ---

// User Account Deletion
app.delete('/api/users/:id', async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });

        // Verify password
        if (user.provider === 'standard') {
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) return res.status(401).json({ message: "Password non corretta. Impossibile eliminare l'account." });
        }

        // Cleanup user data
        await Ticket.deleteMany({ userId: user._id });
        await Order.deleteMany({ userId: user._id });
        await User.findByIdAndDelete(user._id);

        res.json({ message: "Il tuo account e tutti i dati associati sono stati eliminati permanentemente." });
    } catch (error) {
        res.status(500).json({ message: "Errore durante l'eliminazione dell'account" });
    }
});

// Admin Hard Reset (Wipe everything except SuperAdmin)
app.post('/api/admin/hard-reset', async (req, res) => {
    const { password } = req.body;
    if (password !== 'Matty47ghigo231747#') {
        return res.status(401).json({ message: "Autorizzazione negata. Password di hard reset errata." });
    }

    try {
        await Ticket.deleteMany({});
        await Order.deleteMany({});
        // Delete all users EXCEPT the primary admin
        await User.deleteMany({ email: { $ne: 'mattiaghigo60@gmail.com' } });
        
        // Reset stats
        let stats = await Stats.findOne();
        if (stats) {
            stats.visitors = 0;
            stats.registeredUsers = 1;
            stats.orders = 0;
            stats.lastUpdated = new Date();
            await stats.save();
        }

        res.json({ message: "HARD RESET COMPLETATO. Tutti gli utenti (eccetto admin), ticket e ordini sono stati eliminati." });
    } catch (error) {
        res.status(500).json({ message: "Errore durante l'hard reset" });
    }
});

// 2FA Setup
app.post('/api/auth/2fa/setup', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });
        if (!user.email) return res.status(400).json({ message: "Email utente non configurata." });

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email, 'Matty47ghigo Studios', secret);
        const qrCode = await QRCode.toDataURL(otpauth);

        user.twoFactorSecret = secret;
        await user.save();

        res.json({ secret, qrCode });
    } catch (error) {
        console.error("2FA Setup Error:", error);
        res.status(500).json({ message: "Errore durante il setup 2FA" });
    }
});

// 2FA Verify & Enable
app.post('/api/auth/2fa/verify', async (req, res) => {
    const { userId, token } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });

        // Ensure we're using the right secret
        if (!user.twoFactorSecret) return res.status(400).json({ message: "Nessun segreto 2FA configurato" });

        // Sanitize token: remove spaces, ensure it's numeric
        const cleanToken = token.replace(/\s/g, '');
        if (!/^\d{6}$/.test(cleanToken)) {
            return res.status(400).json({ message: "Il codice deve essere composto da 6 cifre numeriche." });
        }

        // Verify using authenticator
        // authenticator.verify uses the options.window defined globally
        const isValid = authenticator.check(cleanToken, user.twoFactorSecret);
        
        if (!isValid) {
            return res.status(400).json({ message: "Codice non valido. Verifica che l'ora del dispositivo sia sincronizzata con Internet." });
        }

        user.isTwoFactorEnabled = true;
        // Generate backup codes
        const backupCodes = Array.from({ length: 5 }, () => crypto.randomBytes(4).toString('hex').toUpperCase());
        user.twoFactorBackupCodes = backupCodes;
        await user.save();

        res.json({ message: "Two-Factor Authentication abilitata!", backupCodes });
    } catch (error) {
        console.error("2FA Verify Error:", error);
        res.status(500).json({ message: "Errore interno durante la verifica 2FA" });
    }
});

// 2FA Disable
app.post('/api/auth/2fa/disable', async (req, res) => {
    const { userId, password } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(401).json({ message: "Password non corretta" });

        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.twoFactorBackupCodes = [];
        await user.save();

        res.json({ message: "Two-Factor Authentication disabilitata" });
    } catch (error) {
        res.status(500).json({ message: "Errore durante la disabilitazione" });
    }
});

// Send 2FA code via email (5 min expiry)
app.post('/api/auth/2fa/send-email-code', async (req, res) => {
    const { userId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utente non trovato" });
        if (!user.email) return res.status(400).json({ message: "Email non configurata" });

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        user.tempAuthCode = code;
        user.tempAuthCodeExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
        await user.save();

        await send2FACodeEmail(user.email, user.name, code);
        
        res.json({ message: "Codice inviato via email. Verifica la tua casella di posta." });
    } catch (error) {
        console.error("Send 2FA Email Error:", error);
        res.status(500).json({ message: "Errore durante l'invio del codice" });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        let stats = await Stats.findOne();
        if (!stats) stats = await Stats.create({});
        
        // Basic Stats
        stats.registeredUsers = await User.countDocuments();
        stats.orders = await Order.countDocuments();
        await stats.save();

        // Detailed Analytics for Admin Dashboard
        // 1. Rating Distribution
        const ratingAgg = await Ticket.aggregate([
            { $match: { rating: { $exists: true } } },
            { $group: { _id: "$rating", count: { $sum: 1 } } }
        ]);
        
        const ratings = [5, 4, 3, 2, 1].map(r => ({
            name: `${r} Stelle`,
            value: (ratingAgg.find(a => a._id === r) || { count: 0 }).count
        }));

        // 2. Weekly Activity (last 7 days)
        const days = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            days.push({
                date: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('it-IT', { weekday: 'short' }),
                count: 0
            });
        }

        const startOfPeriod = new Date();
        startOfPeriod.setDate(now.getDate() - 6);
        startOfPeriod.setHours(0, 0, 0, 0);

        const activityAgg = await Ticket.aggregate([
            { $match: { createdAt: { $gte: startOfPeriod } } },
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
                    count: { $sum: 1 } 
                } 
            }
        ]);

        const activity = days.map(d => ({
            day: d.label,
            tickets: (activityAgg.find(a => a._id === d.date) || { count: 0 }).count
        }));

        res.json({
            ...stats.toObject(),
            ratings,
            activity,
            totalTickets: await Ticket.countDocuments(),
            openTickets: await Ticket.countDocuments({ status: { $ne: 'closed' } })
        });
    } catch (error) {
        console.error("Stats error:", error);
        res.status(500).json({ message: "Error fetching stats" });
    }
});

app.get('/api/users/:id/stats', async (req, res) => {
    try {
        const userId = req.params.id;
        const ordersCount = await Order.countDocuments({ userId });
        const ticketsCount = await Ticket.countDocuments({ userId, status: { $ne: 'closed' } });
        const user = await User.findById(userId);
        const paymentsCount = user?.paymentMethods?.length || 0;
        
        res.json({
            orders: ordersCount,
            tickets: ticketsCount,
            payments: paymentsCount
        });
    } catch (error) {
        res.status(500).json({ message: "Errore caricamento statistiche utente" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
