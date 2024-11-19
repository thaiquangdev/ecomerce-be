const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Kiểm tra xem cấu hình có hợp lệ không
transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter setup failed:", error);
  } else {
    console.log("Email transporter is ready to send emails");
  }
});

module.exports = transporter;
