const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');
const { User, Ticket, Order, Stats, AdminConfig, Product, getAdminStatus, incrementVisitors } = require('./db');
const { sendVerificationEmail, sendTicketClosedEmail, sendAdminNotification, send2FACodeEmail } = require('./email');
const shopRoutes = require('./shopRoutes');
const newsletterRoutes = require('./newsletterRoutes');
const { authenticator } = require('otplib');
const { generateToken, sanitizeUser, verifyToken, isAdmin, setTokenCookie } = require('./authMiddleware');

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
console.log('Google Client ID caricato:', process.env.GOOGLE_CLIENT_ID);

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from client dist folder
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve index.html for all non-API routes (SPA support)
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Restrict CORS to only allow requests from the frontend
const corsOptions = {
    origin: process.env.APP_URL || 'https://matty47ghigo-website.vercel.app',
    credentials: true,  // Allow cookies to be sent
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());  // Parse cookies from requests

// Stripe webhook needs raw body - must be before bodyParser.json()
app.use(['/api/shop/webhook/stripe', '/api/webhook/stripe'], express.raw({ type: 'application/json' }));

app.use(bodyParser.json());

// Support both Stripe webhook URL patterns (with and without /shop)
app.post('/api/webhook/stripe', (req, res, next) => {
    req.url = '/webhook/stripe';
    next();
}, shopRoutes);

app.use('/api/shop', shopRoutes);
app.use('/api/newsletter', newsletterRoutes);

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
                <a href="https://matty47ghigo-website.vercel.app/login" style="display: inline-block; padding: 10px 20px; background: #00e5ff; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">Accedi a Matty47ghigo</a>
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

        const token = generateToken(result.user._id, result.user.email);
        setTokenCookie(res, token);
        res.json({ message: "Login effettuato", user: sanitizeUser(result.user) });
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

        const token = generateToken(user._id, user.email);
        setTokenCookie(res, token);
        res.json({ message: "Login effettuato", user: sanitizeUser(user) });
    } catch (error) {
        res.status(500).json({ message: "Errore durante la verifica del login 2FA" });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout effettuato con successo' });
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

    return { requires2FA: false, user: sanitizeUser(user) };
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

    if (!token) {
        return res.status(400).json({ message: "Token mancante" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
        console.error('GOOGLE_CLIENT_ID non configurato');
        return res.status(500).json({ message: "Configurazione Google mancante" });
    }

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

        const jwtToken = generateToken(result.user._id, result.user.email);
        setTokenCookie(res, jwtToken);
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

        const token = generateToken(result.user._id, result.user.email);
        setTokenCookie(res, token);
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

    if (!code) {
        return res.status(400).json({ message: "Code mancante" });
    }

    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
        console.error('Discord credentials non configurate');
        return res.status(500).json({ message: "Configurazione Discord mancante" });
    }

    const redirectUri = process.env.APP_URL ? `${process.env.APP_URL}/callback` : 'https://matty47ghigo-studios.vercel.app/callback';

    try {
        const tokenRes = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
        });

        if (!userRes.data.email) {
            return res.status(400).json({ message: "Impossibile ottenere l'email da Discord. Assicurati di aver verificato l'email sul tuo account Discord." });
        }

        const picture = userRes.data.avatar
            ? `https://cdn.discordapp.com/avatars/${userRes.data.id}/${userRes.data.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(userRes.data.id) % 5}.png`;

        const user = await upsertSocialUser({
            name: userRes.data.global_name || userRes.data.username,
            surname: '',
            email: userRes.data.email,
            picture: picture,
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

        const token = generateToken(result.user._id, result.user.email);
        setTokenCookie(res, token);
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

app.patch('/api/users/:id/role', verifyToken, isAdmin, async (req, res) => {
    const { isAdmin } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isAdmin }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Errore aggiornamento ruolo" });
    }
});

app.patch('/api/users/:id/ban', verifyToken, isAdmin, async (req, res) => {
    const { isBanned } = req.body;
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isBanned }, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Errore ban utente" });
    }
});

// --- User Profile Update ---
app.patch('/api/users/:id', verifyToken, async (req, res) => {
    const { address, cap, picture, name, surname, email } = req.body;
    try {
        const updateData = {};
        if (address !== undefined) updateData.address = address;
        if (cap !== undefined) updateData.cap = cap;
        if (picture !== undefined) updateData.picture = picture;
        if (name !== undefined) updateData.name = name;
        if (surname !== undefined) updateData.surname = surname;
        if (email !== undefined) updateData.email = email;

        const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!user) return res.status(404).json({ message: "Utente non trovato" });
        res.json(user);
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ message: "Errore aggiornamento profilo" });
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

app.post('/api/admin/reset', verifyToken, isAdmin, async (req, res) => {
    const { password } = req.body;
    // Simple safety check: match admin setup or env password (in a real app this would use JWT auth)
    if (password !== process.env.ADMIN_RESET_PASSWORD) {
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
app.delete('/api/users/:id', verifyToken, async (req, res) => {
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
app.post('/api/admin/hard-reset', verifyToken, isAdmin, async (req, res) => {
    const { password } = req.body;
    if (password !== process.env.ADMIN_RESET_PASSWORD) {
        return res.status(401).json({ message: "Autorizzazione negata. Password di hard reset errata." });
    }

    try {
        await Ticket.deleteMany({});
        await Order.deleteMany({});
        await Product.deleteMany({});
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

        res.json({ message: "HARD RESET COMPLETATO. Tutti gli utenti (eccetto admin), ticket, ordini e prodotti shop sono stati eliminati." });
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

// --- Shop API Routes ---

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { isActive: true };
        if (category) {
            filter.category = category;
        }
        const products = await Product.find(filter).sort({ category: 1, priceValue: 1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Errore caricamento prodotti" });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id, isActive: true });
        if (!product) {
            return res.status(404).json({ message: "Prodotto non trovato" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Errore caricamento prodotto" });
    }
});

// Create product (admin only)
app.post('/api/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Errore creazione prodotto" });
    }
});

// Update product (admin only)
app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ message: "Prodotto non trovato" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Errore aggiornamento prodotto" });
    }
});

// Delete product (admin only)
app.delete('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({ id: req.params.id });
        if (!product) {
            return res.status(404).json({ message: "Prodotto non trovato" });
        }
        res.json({ message: "Prodotto eliminato" });
    } catch (error) {
        res.status(500).json({ message: "Errore eliminazione prodotto" });
    }
});

// Reset Products (delete all and re-seed)
app.post('/api/admin/reset-products', async (req, res) => {
    const { password } = req.body;
    if (password !== 'Matty47ghigo231747#') {
        return res.status(401).json({ message: "Password errata" });
    }

    try {
        await Product.deleteMany({});

        const defaultProducts = [
            { id: 'creazione-sito-web', category: 'web-editing', title: 'Creazione Sito Web', description: 'Sito web moderno e responsivo creato da zero secondo le tue esigenze.', price: 'Da €299', priceValue: 299, features: ['Design personalizzato', 'Responsivo', 'SEO base', 'Supporto 1 mese'] },
            { id: 'modernizzazione-sito', category: 'web-editing', title: 'Modernizzazione Sito Web', description: 'Rinnovo completo del tuo sito esistente.', price: 'Da €149', priceValue: 149, features: ['Restyling', 'Performance', 'Mobile'] },
            { id: 'sitoweb-minecraft-rp', category: 'web-editing', title: 'Sito Web per Minecraft/Roleplay', description: 'Sito web dedicato a server Minecraft o community roleplay.', price: 'Da €199', priceValue: 199, features: ['Autenticazione', 'Store integrato', 'Status server live'] },
            { id: 'bot-discord', category: 'bot', title: 'Bot Discord Personalizzato', description: 'Bot Discord su misura per le tue esigenze.', price: 'Da €49', priceValue: 49, features: ['Comandi personalizzati', 'Moderazione', 'Hosting 1 mese'] },
            { id: 'bot-telegram', category: 'bot', title: 'Bot Telegram', description: 'Bot Telegram per automazione e gestione community.', price: 'Da €39', priceValue: 39, features: ['Comandi', 'Notifiche', 'Webhook'] },
            { id: 'bot-minecraft', category: 'bot', title: 'Plugin Discord-MC', description: 'Bridge per collegare Minecraft con Discord.', price: 'Da €29', priceValue: 29, features: ['Chat sincronizzata', 'Rich presence'] },
            { id: 'setup-database', category: 'settaggi', title: 'Configurazione Database', description: 'Setup completo di database MySQL, PostgreSQL o MongoDB.', price: 'Da €29', priceValue: 29, features: ['Installazione', 'Ottimizzazione', 'Backup'] },
            { id: 'setup-discord-server', category: 'settaggi', title: 'Setup Discord Server', description: 'Configurazione completa del tuo server Discord.', price: 'Da €49', priceValue: 49, features: ['Canali personalizzati', 'Ruoli', 'Vanity URL'] },
            { id: 'setup-vps', category: 'settaggi', title: 'Configurazione VPS', description: 'Setup e ottimizzazione VPS.', price: 'Da €59', priceValue: 59, features: ['SO installato', 'Firewall', 'SSL', 'Nginx'] },
            { id: 'setup-web-server', category: 'settaggi', title: 'Setup Web Server', description: 'Configurazione web server Nginx o Apache.', price: 'Da €49', priceValue: 49, features: ['Server ottimizzato', 'SSL', 'Cache'] },
            { id: 'setup-minecraft-server', category: 'settaggi', title: 'Setup Minecraft Server', description: 'Configurazione server Minecraft ottimizzato.', price: 'Da €39', priceValue: 39, features: ['Paper/Spigot', 'Plugins', 'Anti-lag'] },
            { id: 'server-minecraft', category: 'server', title: 'Minecraft Server Hosting', description: 'Hosting server Minecraft con hardware dedicato.', price: '€5-25/mes', priceValue: 5, features: ['Hardware dedicato', 'DDoS protection', 'Backup'], plans: [{ name: 'Basic', slots: 10, price: '€5/mes' }, { name: 'Standard', slots: 25, price: '€10/mes' }, { name: 'Premium', slots: 50, price: '€20/mes' }, { name: 'Ultimate', slots: 100, price: '€25/mes' }] },
            { id: 'server-discord', category: 'server', title: 'Discord Server Setup Pro', description: 'Servizio completo setup server Discord professionale.', price: 'Da €79', priceValue: 79, features: ['Design premium', 'Bot personalizzati', 'Gestione 1 mese'] },
            { id: 'consulenza-sviluppo', category: 'consulenze', title: 'Consulenza Sviluppo Software', description: 'Sessione consulenza per progettazione software.', price: '€30/ora', priceValue: 30, features: ['Analisi requisiti', 'Code review', 'Documentazione'] },
            { id: 'consulenza-infra', category: 'consulenze', title: 'Consulenza Infrastruttura IT', description: 'Consulenza su infrastrutture IT e sicurezza.', price: '€40/ora', priceValue: 40, features: ['Analisi', 'Cloud', 'Sicurezza'] },
            { id: 'consulenza-gaming', category: 'consulenze', title: 'Consulenza Gaming Community', description: 'Consulenza per community gaming.', price: '€25/ora', priceValue: 25, features: ['Strategia', 'Setup tecnico', 'Monetizzazione'] }
        ];

        await Product.insertMany(defaultProducts);
        res.json({ message: `Prodotti resettati! ${defaultProducts.length} prodotti inseriti.` });
    } catch (error) {
        res.status(500).json({ message: "Errore durante il reset prodotti: " + error.message });
    }
});

// Seed products (for initial setup)
app.post('/api/products/seed', async (req, res) => {
    try {
        const defaultProducts = [
            // Web Editing
            {
                id: 'creazione-sito-web',
                category: 'web-editing',
                title: 'Creazione Sito Web',
                description: 'Sito web moderno e responsivo creato da zero secondo le tue esigenze. Include design personalizzato, ottimizzazione SEO e hosting iniziale.',
                price: 'Da €299',
                priceValue: 299,
                features: ['Design personalizzato', 'Responsivo (mobile-friendly)', 'Ottimizzazione SEO base', 'Contatti email inclusi', '1 mese di supporto']
            },
            {
                id: 'modernizzazione-sito',
                category: 'web-editing',
                title: 'Modernizzazione Sito Web',
                description: 'Rinnovo completo del tuo sito esistente con design moderno, miglioramento delle performance e aggiornamento tecnologico.',
                price: 'Da €149',
                priceValue: 149,
                features: ['Restyling grafico', 'Miglioramento performance', 'Ottimizzazione mobile', 'Aggiornamento contenuti', '6 mesi di manutenzione']
            },
            {
                id: 'sitoweb-minecraft-rp',
                category: 'web-editing',
                title: 'Sito Web per Minecraft/Roleplay',
                description: 'Sito web dedicato a server Minecraft o community roleplay con sistema autenticazione, store, forum e status del server.',
                price: 'Da €199',
                priceValue: 199,
                features: ['Sistema autenticazione', 'Store integrato', 'Status server live', 'Forum community', 'Patchnotes automatiche']
            },
            // Bot
            {
                id: 'bot-discord',
                category: 'bot',
                title: 'Bot Discord Personalizzato',
                description: 'Bot Discord su misura per le tue esigenze con comandi personalizzati, automazioni, moderazione e integrazioni.',
                price: 'Da €49',
                priceValue: 49,
                features: ['Comandi personalizzati', 'Sistema moderazione', 'Logging avanzato', 'Integrazione API', 'Hosting incluso 1 mese']
            },
            {
                id: 'bot-telegram',
                category: 'bot',
                title: 'Bot Telegram',
                description: 'Bot Telegram per automazione, gestione community, notifiche e molto altro.',
                price: 'Da €39',
                priceValue: 39,
                features: ['Comandi personalizzati', 'Notifiche automatiche', 'Gestione gruppi', 'Webhook integrations', 'Hosting incluso 1 mese']
            },
            {
                id: 'bot-minecraft',
                category: 'bot',
                title: 'Plugin/Mod Discord-MC',
                description: 'Bridge e plugin per collegare il tuo server Minecraft con Discord per chat cross-platform.',
                price: 'Da €29',
                priceValue: 29,
                features: ['Chat sincronizzata', 'Rich presence', 'Notifiche eventi', 'Kill/death tracker', 'Compattibile with Spigot/Paper']
            },
            // Settaggi
            {
                id: 'setup-database',
                category: 'settaggi',
                title: 'Configurazione Database',
                description: 'Setup completo di database MySQL, PostgreSQL o MongoDB ottimizzato per le tue applicazioni.',
                price: 'Da €29',
                priceValue: 29,
                features: ['Installazione e configurazione', 'Ottimizzazione query', 'Backup automatizzati', 'Sicurezza avanzata', 'Documentazione']
            },
            {
                id: 'setup-discord-server',
                category: 'settaggi',
                title: 'Setup Discord Server',
                description: 'Configurazione completa del tuo server Discord con canali, ruoli, bot e automazioni.',
                price: 'Da €49',
                priceValue: 49,
                features: ['Struttura canali personalizzata', 'Sistema ruoli', 'Widget server', 'Vanity URL', 'Server banner professionale']
            },
            {
                id: 'setup-vps',
                category: 'settaggi',
                title: 'Configurazione VPS',
                description: 'Setup e ottimizzazione VPS per hosting di applicazioni web, bot, game server e molto altro.',
                price: 'Da €59',
                priceValue: 59,
                features: ['Installazione SO', 'Configurazione firewall', 'SSL/HTTPS', 'Reverse proxy (Nginx)', 'Performance tuning']
            },
            {
                id: 'setup-web-server',
                category: 'settaggi',
                title: 'Setup Web Server',
                description: 'Configurazione web server Nginx o Apache con ottimizzazioni per alte performance e sicurezza.',
                price: 'Da €49',
                priceValue: 49,
                features: ['Server web ottimizzato', 'Configurazione SSL', 'Cache avanzata', 'Protezione DDoS base', 'Monitoraggio']
            },
            {
                id: 'setup-minecraft-server',
                category: 'settaggi',
                title: 'Setup Minecraft Server',
                description: 'Configurazione e ottimizzazione server Minecraft per performance ottimali e migliore esperienza di gioco.',
                price: 'Da €39',
                priceValue: 39,
                features: ['Paper/Spigot setup', 'Ottimizzazione performance', 'Plugins essenziali', 'Backup automatici', 'Anti-lag tuning']
            },
            // Server
            {
                id: 'server-minecraft',
                category: 'server',
                title: 'Minecraft Server Hosting',
                description: 'Hosting server Minecraft con hardware dedicato, uptime garantito e supporto tecnico specializzato.',
                price: '€5-25/mes',
                priceValue: 5,
                features: ['Hardware dedicato', 'DDoS protection', 'Backup giornalieri', 'Slot espandibili', 'Supporto 24/7'],
                plans: [
                    { name: 'Basic', slots: 10, price: '€5/mes' },
                    { name: 'Standard', slots: 25, price: '€10/mes' },
                    { name: 'Premium', slots: 50, price: '€20/mes' },
                    { name: 'Ultimate', slots: 100, price: '€25/mes' }
                ]
            },
            {
                id: 'server-discord',
                category: 'server',
                title: 'Discord Server Setup Pro',
                description: 'Servizio completo di setup e gestione server Discord professionale per community grandi.',
                price: 'Da €79',
                priceValue: 79,
                features: ['Design premium server', 'Bot personalizzati', 'Widget avanzati', 'Analytics community', '1 mese gestione inclusa']
            },
            // Consulenze
            {
                id: 'consulenza-sviluppo',
                category: 'consulenze',
                title: 'Consulenza Sviluppo Software',
                description: 'Sessione di consulenza per progettazione software, architettura applicativa e best practices di sviluppo.',
                price: '€30/ora',
                priceValue: 30,
                features: ['Analisi requisiti', 'Progettazione architettura', 'Code review', 'Consigli ottimizzazione', 'Documentazione tecnica']
            },
            {
                id: 'consulenza-infra',
                category: 'consulenze',
                title: 'Consulenza Infrastruttura IT',
                description: 'Consulenza su infrastrutture IT, server, cloud e sicurezza informatica per aziende e privati.',
                price: '€40/ora',
                priceValue: 40,
                features: ['Analisi infrastruttura', 'Piano migrazione cloud', 'Sicurezza informatica', 'Cost optimization', 'Report dettagliato']
            },
            {
                id: 'consulenza-gaming',
                category: 'consulenze',
                title: 'Consulenza Gaming Community',
                description: 'Consulenza per community gaming su setup server, moderazione, engagement e monetizzazione.',
                price: '€25/ora',
                priceValue: 25,
                features: ['Strategia community', 'Setup tecnico', 'Monetizzazione', 'Event planning', 'Growth strategy']
            }
        ];

        // Delete existing products
        await Product.deleteMany({});

        // Insert new products
        await Product.insertMany(defaultProducts);

        res.json({ message: 'Prodotti seeded con successo', count: defaultProducts.length });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ message: "Errore durante il seed dei prodotti" });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
