import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    console.log(process.env.EMAIL_HOST, process.env.EMAIL_PASSWORD,process.env.EMAIL_PORT,process.env.EMAIL_USERNAME);
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Define the email options
        const mailOptions = {
            from: 'Sharuk <admin@gmail.com>',
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Error sending email');
    }
};

export default sendEmail;
