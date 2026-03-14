const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        image: { type: String, default: "" },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String, default: "" },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "India" },
    },
    paymentInfo: {
      method: {
        type: String,
        enum: ["card", "upi", "netbanking", "wallet", "cod"],
        required: true,
      },
      transactionId: { type: String, default: "" },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      paidAt: Date,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    couponCode: {
      type: String,
      default: "",
    },
    orderStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "placed",
    },
    statusHistory: [
      {
        status: String,
        date: { type: Date, default: Date.now },
        note: { type: String, default: "" },
      },
    ],
    trackingNumber: {
      type: String,
      default: "",
    },
    estimatedDelivery: Date,
    deliveredAt: Date,
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Add initial status to history on creation
orderSchema.pre("save", function (next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: "placed",
      date: new Date(),
      note: "Order placed successfully",
    });
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
