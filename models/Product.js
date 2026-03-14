const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
      maxLength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please select a category"],
    },
    fabricType: {
      type: String,
      required: [true, "Please specify fabric type"],
      enum: [
        "Cotton",
        "Silk",
        "Polyester",
        "Linen",
        "Wool",
        "Denim",
        "Chiffon",
        "Satin",
        "Velvet",
        "Nylon",
        "Rayon",
        "Jute",
        "Organza",
        "Georgette",
        "Crepe",
        "Other",
      ],
    },
    gsm: {
      type: Number,
      default: 0,
      min: [0, "GSM cannot be negative"],
    },
    color: {
      type: String,
      required: [true, "Please specify product color"],
    },
    pattern: {
      type: String,
      enum: [
        "Solid",
        "Striped",
        "Checked",
        "Printed",
        "Embroidered",
        "Woven",
        "Floral",
        "Geometric",
        "Abstract",
        "Plain",
        "Other",
      ],
      default: "Solid",
    },
    width: {
      type: String,
      default: "",
    },
    weight: {
      type: String,
      default: "",
    },
    unit: {
      type: String,
      enum: ["meter", "yard", "piece", "kg", "set"],
      default: "meter",
    },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    minOrderQty: {
      type: Number,
      default: 1,
    },
    bulkPricing: [
      {
        minQty: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    ratings: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: [String],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Text index for search
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, fabricType: 1, price: 1 });

module.exports = mongoose.model("Product", productSchema);
