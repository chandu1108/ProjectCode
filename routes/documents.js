
const express = require("express");
const router = express.Router();
const { createDocument, getDocuments, editDocument, shareDocument } = require("../controllers/documentController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/", protect, createDocument);

router.get("/", protect, getDocuments);

router.put("/:id", protect, editDocument);

router.post("/:id/share", protect, shareDocument);

module.exports = router;



