const Review = require("../models/Review");
const Order = require("../models/Order");

// Get reviews for a product — GET /api/reviews/:productId
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name avatar")
      .sort("-createdAt");

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// Create/update review — POST /api/reviews
exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment } = req.body;

    // Check if user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user.id,
      "items.product": productId,
      orderStatus: "delivered",
    });

    const reviewData = {
      product: productId,
      user: req.user.id,
      rating: Number(rating),
      title,
      comment,
      isVerifiedPurchase: !!hasPurchased,
    };

    // Check if review already exists (update it)
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id,
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.title = title;
      existingReview.comment = comment;
      await existingReview.save();

      return res.status(200).json({
        success: true,
        message: "Review updated",
        review: existingReview,
      });
    }

    const review = await Review.create(reviewData);
    res
      .status(201)
      .json({ success: true, message: "Review submitted", review });
  } catch (error) {
    next(error);
  }
};

// Delete review — DELETE /api/reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    // Only review author or admin can delete
    if (
      review.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await Review.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
};
