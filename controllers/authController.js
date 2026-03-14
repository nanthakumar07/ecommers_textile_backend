const User = require("../models/User");
const sendToken = require("../utils/generateToken");

// Register user — POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password });
    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// Login user — POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter email and password" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Logout — GET /api/auth/logout
exports.logout = async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// Get current user profile — GET /api/auth/me
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Update profile — PUT /api/auth/me
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Update password — PUT /api/auth/password
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    const isMatched = await user.comparePassword(req.body.currentPassword);
    if (!isMatched) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Add address — POST /api/auth/address
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // If this is the first address or marked as default, reset others
    if (req.body.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
      req.body.isDefault = true;
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// Delete address — DELETE /api/auth/address/:id
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.id
    );
    await user.save();

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// Update address — PUT /api/auth/address/:id
exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    if (req.body.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }
    Object.assign(addr, req.body);
    await user.save();
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// Toggle wishlist — POST /api/auth/wishlist/:productId
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const pid = req.params.productId;
    const idx = user.wishlist.findIndex((id) => id.toString() === pid);
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(pid);
    }
    await user.save();
    const updated = await User.findById(req.user.id).populate("wishlist");
    res.status(200).json({ success: true, wishlist: updated.wishlist });
  } catch (error) {
    next(error);
  }
};

// Get wishlist — GET /api/auth/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "wishlist",
      "name price discountPrice images fabricType ratings numReviews stock unit"
    );
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

// Admin: Update user role — PUT /api/auth/admin/users/:id
exports.updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all users — GET /api/auth/admin/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete user — DELETE /api/auth/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await user.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
