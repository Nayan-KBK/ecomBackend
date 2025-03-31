const express = require("express");
const { previewGetSignedUrl } = require("../controllers/previewController.js"); // ✅ FIXED

const router = express.Router();

// Route to get a signed URL for preview images
router.get("/preview-signed-url/:fileName", previewGetSignedUrl);

module.exports = router;
