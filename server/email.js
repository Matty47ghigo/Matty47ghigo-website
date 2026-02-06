const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'business.matty47ghigo@gmail.com',
        pass: 'exlq omdo yzkh wfoq' // User provided App Password
    }
});

const APP_URL = 'http://localhost:5173';

const sendVerificationEmail = async (email, name, token) => {
    const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #050505; padding: 30px; text-align: center;">
            <h1 style="color: #00e5ff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">Matty47ghigo Studios</h1>
        </div>
        <div style="padding: 40px; line-height: 1.6; color: #333333;">
            <h2 style="color: #050505; margin-top: 0;">Benvenuto, ${name}!</h2>
            <p>Grazie per esserti registrato su Matty47ghigo Studios. Per attivare il tuo account e iniziare a esplorare la tua dashboard, clicca sul pulsante qui sotto:</p>
            <div style="text-align: center; margin: 35px 0;">
                <a href="${APP_URL}/verify?token=${token}" style="display: inline-block; padding: 14px 30px; background-color: #00e5ff; color: #050505; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(0, 229, 255, 0.3);">Attiva Account</a>
            </div>
            <p style="font-size: 14px; color: #666;">Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
            <p style="font-size: 12px; word-break: break-all; color: #007BFF;">${APP_URL}/verify?token=${token}</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eeeeee;">
            © 2026 Matty47ghigo Studios. Tutti i diritti riservati.<br>
            Professional Web Development
        </div>
    </div>
    `;

    await transporter.sendMail({
        from: '"Matty47ghigo Studios" <business.matty47ghigo@gmail.com>',
        to: email,
        subject: 'Attiva il tuo account su Matty47ghigo Studios 🚀',
        html
    });
};

const sendTicketClosedEmail = async (email, name, ticketId) => {
    const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
        <div style="background: linear-gradient(135deg, #050505 0%, #1a1a1a 100%); padding: 40px 20px; text-align: center;">
            <div style="display: inline-block; padding: 8px 16px; background: rgba(0, 229, 255, 0.1); border-radius: 32px; color: #00e5ff; font-size: 12px; font-weight: 700; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px;">Update Support</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Ticket Risolto 🏁</h1>
        </div>
        <div style="padding: 48px 40px; color: #1e293b;">
            <p style="font-size: 16px; line-height: 1.6;">Ciao <b>${name}</b>, il tuo ticket di assistenza è stato chiuso con successo dall'amministratore.</p>
            <div style="margin: 32px 0; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9; text-align: center;">
                <p style="margin: 0 0 16px 0; font-weight: 700; color: #0f172a; font-size: 18px;">Come è stata la tua esperienza?</p>
                <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 20px;">
                    <a href="${APP_URL}/feedback?ticketId=${ticketId}&rating=1" style="text-decoration: none; font-size: 32px;">⭐</a>
                    <a href="${APP_URL}/feedback?ticketId=${ticketId}&rating=2" style="text-decoration: none; font-size: 32px;">⭐</a>
                    <a href="${APP_URL}/feedback?ticketId=${ticketId}&rating=3" style="text-decoration: none; font-size: 32px;">⭐</a>
                    <a href="${APP_URL}/feedback?ticketId=${ticketId}&rating=4" style="text-decoration: none; font-size: 32px;">⭐</a>
                    <a href="${APP_URL}/feedback?ticketId=${ticketId}&rating=5" style="text-decoration: none; font-size: 32px;">⭐</a>
                </div>
                <p style="font-size: 13px; color: #64748b; margin: 0;">Clicca su una stella per inviare istantaneamente il tuo feedback.</p>
            </div>
            <div style="text-align: center;">
                <a href="${APP_URL}/dashboard/support" style="display: inline-block; padding: 14px 32px; background-color: #050505; color: #00e5ff; text-decoration: none; border-radius: 12px; font-weight: 700; border: 1px solid #00e5ff; transition: all 0.2s;">Dettagli Ticket</a>
            </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
            © 2026 Matty47ghigo Studios. Inviato da business.matty47ghigo@gmail.com
        </div>
    </div>
    `;

    await transporter.sendMail({
        from: '"Supporto Matty47ghigo" <business.matty47ghigo@gmail.com>',
        to: email,
        subject: `[STUDIOS] Ticket Risolto: Verificato e Chiuso`,
        html
    });
};

const sendAdminNotification = async (userName, ticketSubject, problem, ticketId) => {
    const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 24px rgba(0,0,0,0.04);">
        <div style="background: #050505; padding: 32px 20px; text-align: center; border-bottom: 4px solid #00e5ff;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Nuovo Ticket 🎫</h1>
        </div>
        <div style="padding: 40px 32px; color: #1e293b;">
            <p style="font-size: 14px; color: #64748b; margin-bottom: 8px;">Mittente: <b>${userName}</b></p>
            <h2 style="color: #0f172a; margin: 0 0 24px 0; font-size: 20px; border-left: 4px solid #00e5ff; padding-left: 16px;">${ticketSubject}</h2>
            
            <div style="background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #f1f5f9; margin-bottom: 32px;">
                <p style="margin: 0; line-height: 1.6; color: #334155; font-style: italic;">"${problem}"</p>
            </div>
            
            <div style="text-align: center;">
                <a href="${APP_URL}/dashboard/admin-stats" style="display: inline-block; padding: 14px 40px; background-color: #050505; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 700; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">Gestisci Ticket</a>
            </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">
            System Notification - Matty47ghigo Studios
        </div>
    </div>
    `;

    await transporter.sendMail({
        from: '"System Matty47ghigo" <business.matty47ghigo@gmail.com>',
        to: 'mattiaghigo60@gmail.com',
        subject: `🔥 NUOVO TICKET: ${ticketSubject}`,
        html
    });
};

const send2FACodeEmail = async (email, name, code) => {
    const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #050505; padding: 25px; text-align: center;">
            <h1 style="color: #00e5ff; margin: 0; font-size: 24px; font-weight: 800;">SICUREZZA ACCOUNT</h1>
        </div>
        <div style="padding: 35px; line-height: 1.6; color: #333333; text-align: center;">
            <h2 style="color: #050505; margin-top: 0;">Codice di Verifica</h2>
            <p>Ciao ${name}, usa il codice qui sotto per completare l'accesso al tuo account.</p>
            <div style="margin: 30px 0; background-color: #f4f4f5; padding: 20px; border-radius: 10px; font-size: 32px; font-weight: 900; letter-spacing: 15px; color: #050505; border: 1px dashed #00e5ff;">
                ${code}
            </div>
            <p style="font-size: 13px; color: #999;">Il codice è valido per 5 minuti. Se non hai richiesto tu l'accesso, ignora questa email.</p>
        </div>
    </div>
    `;

    await transporter.sendMail({
        from: '"Sicurezza Matty47ghigo" <business.matty47ghigo@gmail.com>',
        to: email,
        subject: `${code} è il tuo codice di verifica`,
        html
    });
};

const sendPasswordResetEmail = async (email, name, token) => {
    const resetUrl = `${APP_URL}/reset-password?token=${token}`;
    
    const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #050505; padding: 25px; text-align: center;">
            <h1 style="color: #00e5ff; margin: 0; font-size: 24px; font-weight: 800;">RECUPERO PASSWORD</h1>
        </div>
        <div style="padding: 35px; line-height: 1.6; color: #333333;">
            <p>Ciao ${name},</p>
            <p>Abbiamo ricevuto una richiesta di reset della password per il tuo account Matty47ghigo Studios.</p>
            <p>Clicca sul pulsante qui sotto per impostare una nuova password:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 14px 30px; background-color: #00e5ff; color: #050505; text-decoration: none; border-radius: 50px; font-weight: 700; box-shadow: 0 4px 15px rgba(0, 229, 255, 0.3);">Resetta Password</a>
            </div>
            <p style="font-size: 13px; color: #666;">Se non hai richiesto il reset, puoi ignorare questa email. Il link scadrà tra 1 ora.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
            © 2026 Matty47ghigo Studios
        </div>
    </div>
    `;

    await transporter.sendMail({
        from: '"Sicurezza Matty47ghigo" <business.matty47ghigo@gmail.com>',
        to: email,
        subject: 'Reset Password - Matty47ghigo Studios',
        html
    });
};

module.exports = {
    sendVerificationEmail,
    sendTicketClosedEmail,
    sendAdminNotification,
    send2FACodeEmail,
    sendPasswordResetEmail
};
