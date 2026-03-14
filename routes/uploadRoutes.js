const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const path = require("path");
const fs = require("fs");

// Upload single image — POST /api/upload
router.post(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      image: { public_id: req.file.filename, url },
    });
  }
);

// Upload multiple images — POST /api/upload/multiple
router.post(
  "/multiple",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.array("images", 5),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }
    const images = req.files.map((f) => ({
      public_id: f.filename,
      url: `${req.protocol}://${req.get("host")}/uploads/${f.filename}`,
    }));
    res.status(200).json({ success: true, images });
  }
);

// Delete image — DELETE /api/upload/:filename
router.delete(
  "/:filename",
  isAuthenticated,
  authorizeRoles("admin"),
  (req, res) => {
    const filePath = path.join(__dirname, "../uploads", req.params.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(200).json({ success: true, message: "Image deleted" });
    }
    res.status(404).json({ success: false, message: "File not found" });
  }
);

module.exports = router;
