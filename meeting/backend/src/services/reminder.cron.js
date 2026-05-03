const cron = require("node-cron");
const Meeting = require("../models/Meeting");
const User = require("../models/User");
const { logAndMaybeSend } = require("./mailer");
const config = require("../config");

function joinUrl(code) {
  return `${config.appOrigin}/room/${code}`;
}

// Run every minute
const reminderJob = cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    // Find scheduled meetings where reminder hasn't been sent yet
    const upcomingMeetings = await Meeting.find({
      status: "scheduled",
      reminderSent: false,
    });

    for (const meeting of upcomingMeetings) {
      const startAtMs = meeting.startAt.getTime();
      const reminderMs = meeting.reminderMinutesBefore * 60 * 1000;
      
      // If now is past the reminder trigger time
      if (now.getTime() >= startAtMs - reminderMs) {
        const organizer = await User.findById(meeting.organizer);
        if (!organizer) continue;

        const url = joinUrl(meeting.code);
        
        for (const to of meeting.invitees) {
          await logAndMaybeSend(organizer, {
            meetingId: meeting._id,
            type: "reminder",
            to,
            subject: `Reminder: ${meeting.title} is starting soon`,
            text: `Reminder: "${meeting.title}" starts at ${meeting.startAt.toISOString()}.\n\nJoin: ${url}\nCode: ${meeting.code}`,
          });
        }
        
        meeting.reminderSent = true;
        await meeting.save();
      }
    }
  } catch (error) {
    console.error("Reminder cron error:", error);
  }
});

function startReminderJob() {
  reminderJob.start();
  console.log("Reminder cron job started.");
}

module.exports = { startReminderJob };
