const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxLength: [100, "Review title cannot exceed 100 characters"],
    },
    comment: {
      type: String,
      required: [true, "Please add a comment"],
      maxLength: [1000, "Comment cannot exceed 1000 characters"],
    },
    images: [
      {
        public_id: String,
        url: String,
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Only one review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    const Product = mongoose.model("Product");
    if (result.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        ratings: Math.round(result[0].avgRating * 10) / 10,
        numReviews: result[0].numReviews,
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        ratings: 0,
        numReviews: 0,
      });
    }
  } catch (err) {
    console.error("Error updating product ratings:", err);
  }
};

// Recalculate ratings after save/remove
reviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.product);
});

reviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.product);
  }
});

module.exports = mongoose.model("Review", reviewSchema);
