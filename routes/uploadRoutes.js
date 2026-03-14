const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadToR2, deleteFromR2 } = require("../utils/r2");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");

// POST /api/upload — single image
router.post(
  "/",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
      const image = await uploadToR2(req.file);
      res.status(200).json({ success: true, image });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// POST /api/upload/multiple — up to 5 images
router.post(
  "/multiple",
  isAuthenticated,
  authorizeRoles("admin"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: "No files uploaded" });
      }
      const images = await Promise.all(req.files.map((f) => uploadToR2(f)));
      res.status(200).json({ success: true, images });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// DELETE /api/upload/:key — delete by R2 object key (the public_id stored in DB)
router.delete(
  "/:key(*)",
  isAuthenticated,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      await deleteFromR2(req.params.key);
      res.status(200).json({ success: true, message: "Image deleted from R2" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
