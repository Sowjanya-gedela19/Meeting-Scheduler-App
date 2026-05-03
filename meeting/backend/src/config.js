require("dotenv").config();

module.exports = {
  port: Number(process.env.PORT) || 5000,
  mongoUri:
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://127.0.0.1:27017/meeting_scheduler",
  jwtSecret: process.env.JWT_SECRET || "dev-only-change-me",
  appOrigin: process.env.APP_ORIGIN || "http://localhost:3000",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  emailFrom: process.env.EMAIL_FROM || "Meeting Scheduler <noreply@localhost>",
};
