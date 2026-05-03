const Meeting = require("../models/Meeting");
const User = require("../models/User");

async function getAnalytics(req, res) {
  try {
    const totalMeetings = await Meeting.countDocuments({ organizer: req.user._id });
    
    const now = new Date();
    const upcomingMeetings = await Meeting.countDocuments({
      organizer: req.user._id,
      startAt: { $gte: now },
      status: "scheduled"
    });

    const cancelledMeetings = await Meeting.countDocuments({
      organizer: req.user._id,
      status: "cancelled"
    });

    return res.json({
      analytics: {
        totalMeetings,
        upcomingMeetings,
        cancelledMeetings
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load analytics" });
  }
}

module.exports = { getAnalytics };
