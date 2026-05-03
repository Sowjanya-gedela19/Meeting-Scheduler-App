const Meeting = require("../models/Meeting");

async function getCalendar(req, res) {
  try {
    const { type, date } = req.query; // type: day, week, month
    const targetDate = date ? new Date(date) : new Date();
    
    let startDate = new Date(targetDate);
    let endDate = new Date(targetDate);

    if (type === "day") {
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (type === "week") {
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else if (type === "month") {
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0); // last day of current month
      endDate.setHours(23, 59, 59, 999);
    } else {
      // default: return all or maybe just a week
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() + 7);
    }

    const meetings = await Meeting.find({
      organizer: req.user._id,
      startAt: { $gte: startDate, $lte: endDate },
      status: "scheduled"
    }).sort({ startAt: 1 });

    return res.json({ meetings: meetings.map(m => m.toJSON()) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load calendar" });
  }
}

module.exports = { getCalendar };
