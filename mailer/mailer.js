const nodemailer = require('nodemailer');
const fs = require('fs')



module.exports = {
    sendCustomMail : async (recipientEmail, subject, renderedEmailContent, invoiceLocations, invoiceName) => {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'joshfuels.india@gmail.com',
                pass: 'wwvvmxaagrubckyb',
            },
        });
    
        try {
            let mailOptions = {
                from: 'demo@JoshFuels.com',
                to: recipientEmail,
                cc: "accounts@JoshFuels.com",
                subject: subject,
                html: renderedEmailContent,
                attachments: [{
                    filename: invoiceName,
                    path: invoiceLocations
                }]
            };
    
            let info = await transporter.sendMail(mailOptions);
            return { success: true, message: 'Email sent successfully' };
        } catch (error) {
            console.error(error);
            return { success: false, error: 'Failed to send email' };
        }
    },
    verifyEmail: '../../../src/views/mail/email_verification.html',
    invoiceEmail: '../../../src/views/mail/invoice.ejs',
    
}