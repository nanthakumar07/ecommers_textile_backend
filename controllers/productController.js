const Product = require("../models/Product");
const ApiFeatures = require("../utils/apiFeatures");

// Get all products — GET /api/products
exports.getAllProducts = async (req, res, next) => {
  try {
    const resultPerPage = Number(req.query.limit) || 12;

    // Count total matching products (for pagination)
    const countQuery = new ApiFeatures(
      Product.find({ isActive: true }),
      req.query
    )
      .search()
      .filter();
    const totalProducts = await countQuery.query.clone().countDocuments();

    // Get paginated results
    const apiFeature = new ApiFeatures(
      Product.find({ isActive: true }),
      req.query
    )
      .search()
      .filter()
      .sort()
      .paginate(resultPerPage);

    const products = await apiFeature.query.populate("category", "name slug");

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      resultPerPage,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Get single product — GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug"
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Get featured products — GET /api/products/featured
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .limit(8)
      .populate("category", "name slug");

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// Get products by category — GET /api/products/category/:categoryId
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const resultPerPage = Number(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;
    const skip = resultPerPage * (page - 1);

    const filter = { category: req.params.categoryId, isActive: true };
    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort("-createdAt")
      .limit(resultPerPage)
      .skip(skip);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      resultPerPage,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create product — POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    req.body.vendor = req.user.id;

    // Handle images (placeholder URLs for now)
    if (!req.body.images || req.body.images.length === 0) {
      req.body.images = [
        {
          public_id: "default",
          url: "https://via.placeholder.com/500x500?text=Product+Image",
        },
      ];
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Admin: Update product — PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete product — DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    await product.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Admin: Get all products (including inactive) — GET /api/products/admin/all
exports.getAdminProducts = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate("category", "name slug")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};
