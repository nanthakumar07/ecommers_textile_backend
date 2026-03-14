const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  getFeaturedProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts,
} = require("../controllers/productController");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");

// Public routes
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProduct);

// Admin routes
router.post("/", isAuthenticated, authorizeRoles("admin"), createProduct);
router.put("/:id", isAuthenticated, authorizeRoles("admin"), updateProduct);
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), deleteProduct);
router.get(
  "/admin/all",
  isAuthenticated,
  authorizeRoles("admin"),
  getAdminProducts
);

module.exports = router;
