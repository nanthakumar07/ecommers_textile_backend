const multer = require("multer");
const path = require("path");

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const isValid =
    allowed.test(path.extname(file.originalname).toLowerCase()) &&
    allowed.test(file.mimetype);
  isValid ? cb(null, true) : cb(new Error("Only image files are allowed"));
};

// memoryStorage — keeps file as Buffer in req.file.buffer
// (no disk writes; buffer is handed off directly to Cloudflare R2)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;
