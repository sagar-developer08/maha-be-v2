// const nodemailer = require('nodemailer');
// const { MailtrapTransport } = require("mailtrap");

// // Create a transporter object using Mailtrap SMTP settings
// var transporter = nodemailer.createTransport({
//     host: "live.smtp.mailtrap.io",
//     port: 587,
//     auth: {
//       user: "api",
//       pass: "e8965104e8aaabc066dacc4781dae83b"
//     }
//   });

// // Function to send email
// const sendEmail = async ({ to, subject, text }) => {
//   try {
//     const mailOptions = {
//       from: '2b81d802e4-864ab8+1@inbox.mailtrap.io', // Sender address
//       to, // List of receivers
//       subject, // Subject line
//       text, // Plain text body
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent:', info.messageId);
//   } catch (error) {
//     console.error('Error sending email:', error);
//     throw error; // Propagate error for handling in the controller
//   }
// };

// module.exports = { send: sendEmail };

const nodemailer = require("nodemailer");
// const { MailtrapTransport } = require("mailtrap");

// const TOKEN = "15739bca212db9305496cf35a4cee6ac"; // Replace with your Mailtrap token
// const INBOX_ID = "3157116"; // Replace with your Mailtrap inbox ID

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "devteam@prism-me.com",
    pass: "dmqy tyxq cgou mivm",
  },
});

// Function to send email
const sendEmail = async ({ to, subject, text }) => {
  try {
    const sender = {
      address: "no-reply@mahaballoonadventures.com", // Adjust as necessary
      name: "Maha Balloon Adventures ",
    };

    const mailOptions = {
      from: sender,
      to, // List of receivers
      subject, // Subject line
      text, // Plain text body
      category: "Integration Test", // Optional
      sandbox: true, // Optional, use if you're in testing mode
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error; // Propagate error for handling in the controller
  }
};

module.exports = { send: sendEmail };
