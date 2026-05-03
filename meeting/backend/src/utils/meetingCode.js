const Meeting = require("../models/Meeting");

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode() {
  let s = "";
  for (let i = 0; i < 6; i += 1) {
    s += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return s;
}

async function generateUniqueCode() {
  for (let n = 0; n < 100; n += 1) {
    const code = randomCode();
    // eslint-disable-next-line no-await-in-loop
    const exists = await Meeting.exists({ code });
    if (!exists) return code;
  }
  throw new Error("Could not allocate meeting code");
}

module.exports = { generateUniqueCode };
