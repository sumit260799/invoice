const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAllocationEmail = async (agentEmail, subject, text, res) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: agentEmail,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${agentEmail}`);
  } catch (error) {
    return res.status(401).json({ message: `Error ${error}` });
  }
};

module.exports = sendAllocationEmail;