const mongoose = require("mongoose");

const connectDB = async () => {
    const connect = await mongoose.connect(process.env.MONGODB_URL);
    console.log(`Database Connected : ${connect.connection.host}`);
}

module.exports = connectDB;