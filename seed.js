const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");

const connectDB = require("./config/db");

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data and drop stale indexes
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    // Drop indexes to clean up stale unique constraints from previous failed runs
    await Category.collection.dropIndexes().catch(() => {});

    console.log("Cleared existing data...");

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@textilestore.com",
      password: "admin123",
      role: "admin",
    });

    // Create sample customer
    const customer = await User.create({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "customer",
      addresses: [
        {
          fullName: "John Doe",
          phone: "9876543210",
          addressLine1: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "India",
          isDefault: true,
        },
      ],
    });

    console.log("Created users...");

    // Create categories (use .create() so pre-save hook generates slugs)
    const categories = await Category.create([
      { name: "Fabrics", description: "Raw fabrics and textiles" },
      { name: "Garments", description: "Ready-made clothing" },
      { name: "Accessories", description: "Textile accessories and supplies" },
      { name: "Home Textiles", description: "Curtains, bed sheets, and more" },
      { name: "Traditional Wear", description: "Sarees, kurtas, and ethnic wear" },
    ]);

    console.log("Created categories...");

    // Create sample products (use .create() to trigger any middleware)
    const products = await Product.create([
      {
        name: "Premium Cotton Fabric - White",
        description:
          "High-quality 100% pure cotton fabric perfect for summer wear. Soft, breathable, and comfortable. Ideal for shirts, dresses, and casual wear.",
        price: 450,
        discountPrice: 399,
        category: categories[0]._id,
        fabricType: "Cotton",
        gsm: 120,
        color: "White",
        pattern: "Solid",
        unit: "meter",
        images: [{ public_id: "cotton_white", url: "https://via.placeholder.com/500x500/FFFFFF/333333?text=Cotton+White" }],
        stock: 500,
        isFeatured: true,
        tags: ["cotton", "white", "summer", "breathable"],
        vendor: admin._id,
      },
      {
        name: "Banarasi Silk Fabric - Royal Blue",
        description:
          "Exquisite handwoven Banarasi silk with intricate gold zari work. Perfect for sarees, lehengas, and wedding attire. Rich texture and vibrant color.",
        price: 2500,
        discountPrice: 2199,
        category: categories[4]._id,
        fabricType: "Silk",
        gsm: 80,
        color: "Royal Blue",
        pattern: "Woven",
        unit: "meter",
        images: [{ public_id: "silk_blue", url: "https://via.placeholder.com/500x500/1a3c6e/FFFFFF?text=Silk+Blue" }],
        stock: 100,
        isFeatured: true,
        tags: ["silk", "banarasi", "wedding", "traditional"],
        vendor: admin._id,
      },
      {
        name: "Denim Fabric - Indigo Wash",
        description:
          "Premium quality denim fabric with classic indigo wash finish. 12oz weight, perfect for jeans, jackets, and denim wear. Pre-shrunk and fade-resistant.",
        price: 750,
        category: categories[0]._id,
        fabricType: "Denim",
        gsm: 340,
        color: "Indigo",
        pattern: "Solid",
        unit: "meter",
        images: [{ public_id: "denim_indigo", url: "https://via.placeholder.com/500x500/1a237e/FFFFFF?text=Denim+Indigo" }],
        stock: 300,
        isFeatured: true,
        tags: ["denim", "indigo", "jeans", "casual"],
        vendor: admin._id,
      },
      {
        name: "Linen Fabric - Natural Beige",
        description:
          "Premium European linen fabric in natural beige. Lightweight, breathable, and perfect for summer clothing and home textiles. Gets softer with each wash.",
        price: 850,
        discountPrice: 749,
        category: categories[0]._id,
        fabricType: "Linen",
        gsm: 150,
        color: "Beige",
        pattern: "Plain",
        unit: "meter",
        images: [{ public_id: "linen_beige", url: "https://via.placeholder.com/500x500/d4c5a9/333333?text=Linen+Beige" }],
        stock: 200,
        isFeatured: true,
        tags: ["linen", "summer", "natural", "breathable"],
        vendor: admin._id,
      },
      {
        name: "Printed Chiffon - Floral Garden",
        description:
          "Elegant chiffon fabric with beautiful floral prints. Lightweight and flowing, ideal for sarees, dupattas, scarves, and evening wear.",
        price: 550,
        category: categories[0]._id,
        fabricType: "Chiffon",
        gsm: 40,
        color: "Multicolor",
        pattern: "Floral",
        unit: "meter",
        images: [{ public_id: "chiffon_floral", url: "https://via.placeholder.com/500x500/f8bbd0/333333?text=Chiffon+Floral" }],
        stock: 150,
        tags: ["chiffon", "floral", "lightweight", "saree"],
        vendor: admin._id,
      },
      {
        name: "Velvet Fabric - Emerald Green",
        description:
          "Luxurious crushed velvet fabric in deep emerald green. Rich texture with beautiful sheen. Perfect for upholstery, curtains, and evening wear.",
        price: 1200,
        discountPrice: 999,
        category: categories[3]._id,
        fabricType: "Velvet",
        gsm: 280,
        color: "Emerald Green",
        pattern: "Solid",
        unit: "meter",
        images: [{ public_id: "velvet_green", url: "https://via.placeholder.com/500x500/006400/FFFFFF?text=Velvet+Green" }],
        stock: 80,
        isFeatured: true,
        tags: ["velvet", "luxury", "upholstery", "curtains"],
        vendor: admin._id,
      },
      {
        name: "Georgette Fabric - Peach",
        description:
          "Soft and flowing georgette fabric in elegant peach shade. Slightly textured surface with beautiful drape. Ideal for sarees, gowns, and party wear.",
        price: 480,
        category: categories[0]._id,
        fabricType: "Georgette",
        gsm: 60,
        color: "Peach",
        pattern: "Solid",
        unit: "meter",
        images: [{ public_id: "georgette_peach", url: "https://via.placeholder.com/500x500/ffdab9/333333?text=Georgette+Peach" }],
        stock: 200,
        tags: ["georgette", "peach", "party", "elegant"],
        vendor: admin._id,
      },
      {
        name: "Cotton Bed Sheet Set - Paisley Print",
        description:
          "King-size cotton bed sheet set with traditional paisley print. Includes 1 flat sheet and 2 pillow covers. 300 thread count, machine washable.",
        price: 1800,
        discountPrice: 1499,
        category: categories[3]._id,
        fabricType: "Cotton",
        gsm: 200,
        color: "Blue",
        pattern: "Printed",
        unit: "set",
        images: [{ public_id: "bedsheet_paisley", url: "https://via.placeholder.com/500x500/4169E1/FFFFFF?text=Bed+Sheet+Set" }],
        stock: 60,
        isFeatured: true,
        tags: ["bedsheet", "cotton", "home", "paisley"],
        vendor: admin._id,
      },
    ]);

    console.log("Created products...");
    console.log("\n--- Seed Complete ---");
    console.log(`Admin Login:  admin@textilestore.com / admin123`);
    console.log(`Customer Login: john@example.com / password123`);
    console.log(`Categories: ${categories.length}`);
    console.log(`Products: ${products.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Seed Error:", error);
    process.exit(1);
  }
};

seedData();
