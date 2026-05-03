const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");

function signToken(userId) {
  return jwt.sign({ sub: userId.toString() }, config.jwtSecret, { expiresIn: "7d" });
}

function userResponse(user) {
  const j = user.toJSON();
  return {
    id: j.id,
    email: j.email,
    displayTimeZone: j.displayTimeZone,
    simulateEmail: j.simulateEmail,
    personalBusy: j.personalBusy || [],
  };
}

async function register(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    const exists = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (exists) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: String(email).trim().toLowerCase(),
      passwordHash,
    });
    const token = signToken(user._id);
    return res.status(201).json({ token, user: userResponse(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Registration failed" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = signToken(user._id);
    return res.json({ token, user: userResponse(user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Login failed" });
  }
}

async function me(req, res) {
  return res.json({ user: userResponse(req.user) });
}

module.exports = { register, login, me, userResponse };
