// backend/libs/send-email.js
import nodemailer from 'nodemailer';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `TaskHub <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

export const sendEmailWithAttachment = async (to, subject, html, attachmentPath, fileName) => {
  // Check if attachment file exists
  if (!fs.existsSync(attachmentPath)) {
    console.error('❌ Attachment file not found:', attachmentPath);
    return false;
  }

  const mailOptions = {
    from: `TaskHub <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments: [
      {
        filename: fileName,
        path: attachmentPath,
      },
    ],
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email with attachment sent:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Error sending email with attachment:', error);
    return false;
  }
};











// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export const sendEmail = async (to, subject, html) => {
//   const mailOptions = {
//     from: `TaskHub <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   };

//   try {
//     const info = await transporter.sendMail(mailOptions);
//     console.log('✅ Email sent:', info.response);
//     return true;
//   } catch (error) {
//     console.error('❌ Error sending email:', error);
//     return false;
//   }
// };
