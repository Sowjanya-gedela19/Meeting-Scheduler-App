const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
  {
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    invitees: { type: [String], default: [] },
    reminderMinutesBefore: { type: Number, default: 15 },
    reminderSent: { type: Boolean, default: false },
    timeZone: { type: String, required: true },
    status: { type: String, enum: ["scheduled", "cancelled"], default: "scheduled" },
    recurring: { type: String, enum: ["none", "daily", "weekly", "monthly"], default: "none" },
    code: { type: String, required: true, unique: true, uppercase: true, length: 6 },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

meetingSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    ret.startISO = ret.startAt ? new Date(ret.startAt).toISOString() : null;
    ret.endISO = ret.endAt ? new Date(ret.endAt).toISOString() : null;
    if (ret.cancelledAt) {
      ret.cancelledAt = new Date(ret.cancelledAt).toISOString();
    }
    delete ret._id;
    delete ret.__v;
    delete ret.startAt;
    delete ret.endAt;
    delete ret.organizer;
    return ret;
  },
});

module.exports = mongoose.model("Meeting", meetingSchema);
