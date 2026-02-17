const jwt = require('jsonwebtoken');
const { User } = require('./db');

// Verify JWT token middleware
const verifyToken = async (req, res, next) => {
    try {
        // Read token from HTTP-only cookie instead of Authorization header
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'Token di autenticazione mancante' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user ID to request
        req.userId = decoded.userId;
        req.userEmail = decoded.email;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token non valido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token scaduto' });
        }
        return res.status(500).json({ message: 'Errore verifica autenticazione' });
    }
};

// Check if user is admin middleware
const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: 'Accesso negato. Solo gli amministratori possono accedere a questa risorsa.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Errore verifica permessi' });
    }
};

// Generate JWT token
const generateToken = (userId, email) => {
    return jwt.sign(
        { userId, email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' } // Token expires in 7 days
    );
};

// Set HTTP-only cookie with JWT token
const setTokenCookie = (res, token) => {
    res.cookie('token', token, {
        httpOnly: true,      // Prevents JavaScript access (XSS protection)
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
        sameSite: 'strict',  // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
    });
};

// Sanitize user object before sending to client
const sanitizeUser = (user) => {
    const userObj = user.toObject ? user.toObject() : user;

    // Remove sensitive fields
    delete userObj.passwordHash;
    delete userObj.twoFactorSecret;
    delete userObj.twoFactorBackupCodes;
    delete userObj.tempAuthCode;
    delete userObj.tempAuthCodeExpires;
    delete userObj.resetPasswordToken;
    delete userObj.resetPasswordExpires;
    delete userObj.verificationToken;

    return userObj;
};

module.exports = {
    verifyToken,
    isAdmin,
    generateToken,
    setTokenCookie,
    sanitizeUser
};
