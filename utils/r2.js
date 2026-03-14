const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const path = require("path");

// Cloudflare R2 is S3-compatible — endpoint uses your Account ID
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a multer memory-buffer file to R2.
 * @param {Express.Multer.File} file  — req.file or req.files[n]
 * @returns {{ public_id: string, url: string }}
 */
const uploadToR2 = async (file) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const key = `products/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket:      process.env.R2_BUCKET_NAME,
      Key:         key,
      Body:        file.buffer,
      ContentType: file.mimetype,
    })
  );

  // R2_PUBLIC_URL e.g. https://pub-xxxx.r2.dev  OR  https://cdn.yourdomain.com
  const url = `${process.env.R2_PUBLIC_URL}/${key}`;
  return { public_id: key, url };
};

/**
 * Delete an object from R2 by its key (public_id).
 * @param {string} key
 */
const deleteFromR2 = async (key) => {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key:    key,
    })
  );
};

module.exports = { uploadToR2, deleteFromR2 };
