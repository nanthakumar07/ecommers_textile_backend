const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// Create new order — POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalAmount,
      couponCode,
      discountAmount,
    } = req.body;

    // Verify stock for each item
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalAmount,
      couponCode,
      discountAmount,
    });

    // Deduct stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear user's cart
    await User.findByIdAndUpdate(req.user.id, { cart: [] });

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// Get single order — GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name images");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Ensure user can only see their own orders (unless admin)
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// Get my orders — GET /api/orders/me
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name images")
      .sort("-createdAt");

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// Cancel order — PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a shipped or delivered order",
      });
    }

    order.orderStatus = "cancelled";
    order.statusHistory.push({
      status: "cancelled",
      date: new Date(),
      note: req.body.reason || "Cancelled by user",
    });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all orders — GET /api/orders/admin/all
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort("-createdAt");

    // Calculate total revenue
    const totalRevenue = orders.reduce(
      (sum, order) =>
        order.orderStatus !== "cancelled" ? sum + order.totalAmount : sum,
      0
    );

    res.status(200).json({
      success: true,
      count: orders.length,
      totalRevenue,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update order status — PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Order already delivered",
      });
    }

    order.orderStatus = req.body.status;
    order.statusHistory.push({
      status: req.body.status,
      date: new Date(),
      note: req.body.note || "",
    });

    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    if (req.body.status === "delivered") {
      order.deliveredAt = new Date();
      order.paymentInfo.status = "paid";
      order.paymentInfo.paidAt = new Date();
    }

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
