
const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
    invitedEmail: { type: String, required: true },
    token: { type: String, required: true },
    accepted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invite", inviteSchema);
