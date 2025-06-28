// check_categories.js
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/Timefy");
const Product = require("./models/product.models");

Product.find({}, "name category").then((products) => {
  products.forEach((p) => {
    console.log(`${p.name}: ${p.category}`);
  });
  mongoose.disconnect();
});
