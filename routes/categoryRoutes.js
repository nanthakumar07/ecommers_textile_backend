const express = require("express");
const router = express.Router();
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");

router.get("/", getAllCategories);
router.get("/:id", getCategory);

// Admin
router.post("/", isAuthenticated, authorizeRoles("admin"), createCategory);
router.put("/:id", isAuthenticated, authorizeRoles("admin"), updateCategory);
router.delete("/:id", isAuthenticated, authorizeRoles("admin"), deleteCategory);

module.exports = router;
