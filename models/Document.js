
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);
module.exports = Document;