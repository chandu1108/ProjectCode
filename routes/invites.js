
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Invite = require("../models/Invite");
const Document = require("../models/Document");
const User = require("../models/User");

router.get("/accept/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { documentId, invitedEmail } = decoded;

    const invite = await Invite.findOne({ token });
    if (!invite) return res.status(400).json({ message: "Invalid or expired invite" });

    const user = await User.findOne({ email: invitedEmail });
    if (!user) return res.status(404).json({ message: "Invited user not found" });

    const document = await Document.findById(documentId);
    if (!document) return res.status(404).json({ message: "Document not found" });

    if (!document.sharedWith.includes(user._id)) {
      document.sharedWith.push(user._id);
      await document.save();
    }

    await Invite.deleteOne({ _id: invite._id });

    res.json({ message: "Invite accepted. You now have access to the document." });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;



