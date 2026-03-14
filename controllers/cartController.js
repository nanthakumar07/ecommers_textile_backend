const User = require("../models/User");
const Product = require("../models/Product");

// Get cart — GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "cart.product",
      "name price discountPrice images stock unit"
    );

    const cartItems = user.cart.filter((item) => item.product !== null);

    // Calculate totals
    let subtotal = 0;
    const items = cartItems.map((item) => {
      const price = item.product.discountPrice || item.product.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
      return {
        _id: item._id,
        product: item.product,
        quantity: item.quantity,
        itemTotal,
      };
    });

    res.status(200).json({
      success: true,
      cart: {
        items,
        subtotal,
        itemCount: items.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Add to cart — POST /api/cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Verify product exists and has stock
    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock" });
    }

    const user = await User.findById(req.user.id);

    // Check if product already in cart
    const existingIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      user.cart[existingIndex].quantity += quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cartItemCount: user.cart.length,
    });
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity — PUT /api/cart/:itemId
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user.id);

    const cartItem = user.cart.id(req.params.itemId);
    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Cart item not found" });
    }

    // Check stock
    const product = await Product.findById(cartItem.product);
    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock" });
    }

    cartItem.quantity = quantity;
    await user.save();

    res.status(200).json({ success: true, message: "Cart updated" });
  } catch (error) {
    next(error);
  }
};

// Remove from cart — DELETE /api/cart/:itemId
exports.removeFromCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(
      (item) => item._id.toString() !== req.params.itemId
    );
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Item removed from cart" });
  } catch (error) {
    next(error);
  }
};

// Clear cart — DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();

    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (error) {
    next(error);
  }
};
