const nodemailer = require("nodemailer");
const config = require("../config");
const EmailLog = require("../models/EmailLog");

let transporter = null;

function getTransporter() {
  if (!config.smtp.host || !config.smtp.user) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    });
  }
  return transporter;
}

/**
 * @param {import("../models/User")} user
 */
async function logAndMaybeSend(user, { meetingId, type, to, subject, text }) {
  const doc = await EmailLog.create({
    user: user._id,
    meeting: meetingId || null,
    type,
    to,
    subject,
    body: text,
    sent: false,
  });

  const allowSend = user.simulateEmail !== false;
  const tx = getTransporter();

  if (!allowSend || !tx) {
    return doc;
  }

  try {
    await tx.sendMail({
      from: config.emailFrom,
      to,
      subject,
      text,
    });
    doc.sent = true;
    doc.error = null;
    await doc.save();
  } catch (err) {
    doc.error = err.message || String(err);
    await doc.save();
  }
  return doc;
}

module.exports = { logAndMaybeSend, getTransporter };
