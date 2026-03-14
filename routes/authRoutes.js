const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  updatePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
  getWishlist,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/authController");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

router.get("/me", isAuthenticated, getProfile);
router.put("/me", isAuthenticated, updateProfile);
router.put("/password", isAuthenticated, updatePassword);

router.post("/address", isAuthenticated, addAddress);
router.put("/address/:id", isAuthenticated, updateAddress);
router.delete("/address/:id", isAuthenticated, deleteAddress);

router.get("/wishlist", isAuthenticated, getWishlist);
router.post("/wishlist/:productId", isAuthenticated, toggleWishlist);

// Admin
router.get("/admin/users",    isAuthenticated, authorizeRoles("admin"), getAllUsers);
router.put("/admin/users/:id", isAuthenticated, authorizeRoles("admin"), updateUserRole);
router.delete("/admin/users/:id", isAuthenticated, authorizeRoles("admin"), deleteUser);

module.exports = router;
