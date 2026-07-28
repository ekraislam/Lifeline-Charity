const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: '"Lifeline Support" <no-reply@lifeline.com>',
            to,
            subject,
            html
        });
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendEmail };
