const connectDB = require("./config/db");
const mongoose = require("mongoose");
const Product = require("./models/product.models");

const products = [
  {
    name: "Premium Plan 1",
    category: "premium",
    price: 10000,
    totalReturn: 50000,
    dailyReturn: 250,
    duration: "40 days",
    description: "High yield premium investment plan",
  },
  {
    name: "Premium Plan 2",
    category: "premium",
    price: 5000,
    totalReturn: 25000,
    dailyReturn: 250,
    duration: "40 days",
    description: "High yield premium investment plan",
  },
  {
    name: "Premium Plan 3",
    category: "premium",
    price: 15000,
    totalReturn: 75000,
    dailyReturn: 800,
    duration: "40 days",
    description: "High yield premium investment plan",
  },
  {
    name: "Premium Plan 4",
    category: "premium",
    price: 20000,
    totalReturn: 85000,
    dailyReturn: 1200,
    duration: "40 days",
    description: "High yield premium investment plan",
  },
  {
    name: "Premium Plan 5",
    category: "premium",
    price: 25000,
    totalReturn: 100000,
    dailyReturn: 1500,
    duration: "40 days",
    description: "High yield premium investment plan",
  },
  {
    name: "Premium Plan 6",
    category: "premium",
    price: 39000,
    totalReturn: 125000,
    dailyReturn: 2000,
    duration: "40 days",
    description: "High yield premium investment plan",
  },
  {
    name: "Premium Plan 7",
    category: "premium",
    price: 40000,
    totalReturn: 150000,
    dailyReturn: 2500,
    duration: "40 days",
    description: "High yield premium investment plan",
  },
  {
    name: "Premium Plan 8",
    category: "premium",
    price: 50000,
    totalReturn: 170000,
    dailyReturn: 5000,
    duration: "40 days",
    description: "High yield premium investment plan",
  },
  {
    name: "Alpha Plan 1",
    category: "alpha",
    price: 50000,
    totalReturn: 100000,
    dailyReturn: 5000,
    duration: "20 days",
    description: "Alpha plan for steady returns",
  },
  {
    name: "Alpha Plan 2",
    category: "alpha",
    price: 60000,
    totalReturn: 120000,
    dailyReturn: 8000,
    duration: "20 days",
    description: "Alpha plan for steady returns",
  },
  {
    name: "Alpha Plan 3",
    category: "alpha",
    price: 70000,
    totalReturn: 140000,
    dailyReturn: 10000,
    duration: "20 days",
    description: "Alpha plan for steady returns",
  },
  {
    name: "Alpha Plan 4",
    category: "alpha",
    price: 80000,
    totalReturn: 160000,
    dailyReturn: 12000,
    duration: "20 days",
    description: "Alpha plan for steady returns",
  },
  {
    name: "Alpha Plan 5",
    category: "alpha",
    price: 100000,
    totalReturn: 200000,
    dailyReturn: 20000,
    duration: "20 days",
    description: "Alpha plan for steady returns",
  },
  {
    name: "Alpha Plan 6",
    category: "alpha",
    price: 120000,
    totalReturn: 225000,
    dailyReturn: 23500,
    duration: "20 days",
    description: "Alpha plan for steady returns",
  },
  {
    name: "Alpha Plan 7",
    category: "alpha",
    price: 150000,
    totalReturn: 250000,
    dailyReturn: 25000,
    duration: "20 days",
    description: "Alpha plan for steady returns",
  },
  {
    name: "Alpha Plan 8",
    category: "alpha",
    price: 200000,
    totalReturn: 300000,
    dailyReturn: 30000,
    duration: "40 days",
    description: "High yield premium investment plan",
  },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log("Products seeded!");
  mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Error seeding products:", err);
  mongoose.disconnect();
});
