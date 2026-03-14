const express = require("express");
const router = express.Router();
const {
  getProductReviews,
  createReview,
  deleteReview,
} = require("../controllers/reviewController");
const { isAuthenticated } = require("../middleware/auth");

router.get("/:productId", getProductReviews);
router.post("/", isAuthenticated, createReview);
router.delete("/:id", isAuthenticated, deleteReview);

module.exports = router;
