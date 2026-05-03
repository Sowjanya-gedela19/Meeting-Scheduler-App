const mongoose = require("mongoose");

const emailLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting", default: null },
    type: { type: String, enum: ["invite", "update", "cancel", "reminder"], required: true },
    to: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    sent: { type: Boolean, default: false },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

emailLogSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    ret.createdAt = ret.createdAt || ret.updatedAt;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("EmailLog", emailLogSchema);
