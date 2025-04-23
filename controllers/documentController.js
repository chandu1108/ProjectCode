const Document = require("../models/Document");
const User = require("../models/User");
const Invite = require("../models/Invite");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const createDocument = async (req, res) => {
  const { title, content } = req.body;

  try {

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: user not found in request" });
    }

    const document = new Document({
      title,
      content,
      ownerId: req.user._id, 
    });
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: "Error creating document",error: error.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [
        { ownerId: req.user._id },
        { sharedWith: { $in: [req.user._id] } },
      ],
    });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching documents" });
  }
};

const editDocument = async (req, res) => {
  const { title, content } = req.body;
  const documentId = req.params.id;

  try {
    const document = await Document.findById(documentId);
    if (!document) return res.status(404).json({ message: "Document not found" });

    if (document.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not the owner of this document" });
    }

    document.title = title || document.title;
    document.content = content || document.content;

    await document.save();
    res.json(document);
  } catch (error) {
    res.status(500).json({ message: "Error editing document" });
  }
};

const shareDocument = async (req, res) => {
  const { invitedEmail } = req.body;
  const documentId = req.params.id;

  try {
    const document = await Document.findById(documentId);
    if (!document) return res.status(404).json({ message: "Document not found" });

    if (document.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not the owner of this document" });
    }

    const inviteToken = jwt.sign({ documentId, invitedEmail }, process.env.JWT_SECRET, { expiresIn: "1h" });

    const invite = new Invite({
      documentId,
      invitedEmail,
      token: inviteToken,
    });
    const sendEmail = require("../utils/sendEmails");

    await sendEmail(
    invitedEmail,
    "Document Sharing Invitation",
    `You have been invited to view a document. Click the following link to accept: ${process.env.BASE_URL}/api/invites/accept/${inviteToken}`
    );


    await invite.save();
    console.log("Sending email to:", invitedEmail);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ message: "Error sending email", error: error.toString() });
        }
        res.json({ message: "Invite sent successfully" });
      });
      

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: invitedEmail,
      subject: "Document Sharing Invitation",
      text: `You have been invited to view a document. Click the following link to accept the invitation: ${process.env.BASE_URL}/api/invites/accept/${inviteToken}`,
    };
    console.log(`Invite link: ${process.env.BASE_URL}/api/invites/accept/${inviteToken}`);


    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: "Error sending email" });
      }
      res.json({ message: "Invite sent successfully" });
    });
  } catch (error) {
    res.status(500).json({ message: "Error sharing document" });
  }
};

module.exports = { createDocument, getDocuments, editDocument, shareDocument };
