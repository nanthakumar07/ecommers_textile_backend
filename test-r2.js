/**
 * Quick R2 connectivity test — run once, then delete.
 * Usage:  node test-r2.js
 */
require("dotenv").config();
const { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const TEST_KEY = "test/r2-connectivity-check.txt";

async function run() {
  console.log("\n📡 Testing Cloudflare R2 connectivity...");
  console.log(`   Bucket  : ${BUCKET}`);
  console.log(`   Endpoint: https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
  console.log(`   Public  : ${process.env.R2_PUBLIC_URL}\n`);

  try {
    // 1. Upload test object
    await client.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         TEST_KEY,
      Body:        Buffer.from("R2 test OK"),
      ContentType: "text/plain",
    }));
    console.log("✅ PutObject  — upload works");

    // 2. Verify public URL is reachable
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${TEST_KEY}`;
    console.log(`   Public URL : ${publicUrl}`);

    // 3. Delete test object
    await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: TEST_KEY }));
    console.log("✅ DeleteObject — delete works");

    console.log("\n🎉 R2 is fully configured and working!\n");
  } catch (err) {
    console.error("\n❌ R2 Error:", err.message);
    if (err.message.includes("InvalidAccessKeyId")) {
      console.error("   → Check R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY");
    } else if (err.message.includes("NoSuchBucket")) {
      console.error("   → Bucket name wrong — check R2_BUCKET_NAME");
    } else if (err.Code === "ENOTFOUND" || err.message.includes("ENOTFOUND")) {
      console.error("   → R2_ACCOUNT_ID is wrong or missing");
    }
    process.exit(1);
  }
}

run();
