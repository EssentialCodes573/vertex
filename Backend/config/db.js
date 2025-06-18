const mongoose = require("mongoose");
require("dotenv").config();
// console.log('Loaded MONGO_URI:', process.env.MONGO_URI);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        // console.log('MONGO_URI:', process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // process code 1 means exit with failure, 0 means success.
    }
}

module.exports = connectDB;