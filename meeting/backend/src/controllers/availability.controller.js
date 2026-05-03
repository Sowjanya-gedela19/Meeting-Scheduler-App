const { userResponse } = require("./auth.controller");

async function getAvailability(req, res) {
  try {
    return res.json({ availability: req.user.personalBusy || [] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to get availability" });
  }
}

async function updateAvailability(req, res) {
  try {
    const { personalBusy } = req.body;
    if (personalBusy !== undefined) {
      req.user.personalBusy = Array.isArray(personalBusy)
        ? personalBusy.map(String)
        : [];
      await req.user.save();
    }
    return res.json({ user: userResponse(req.user) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to update availability" });
  }
}

module.exports = { getAvailability, updateAvailability };
