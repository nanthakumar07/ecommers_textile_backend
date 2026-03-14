const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrder,
  getMyOrders,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");

router.use(isAuthenticated); // All order routes require auth

router.post("/", createOrder);
router.get("/me", getMyOrders);
router.get("/:id", getOrder);
router.put("/:id/cancel", cancelOrder);

// Admin
router.get("/admin/all", authorizeRoles("admin"), getAllOrders);
router.put("/:id/status", authorizeRoles("admin"), updateOrderStatus);

module.exports = router;
