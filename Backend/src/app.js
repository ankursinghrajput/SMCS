const express = require("express");
const connectDB = require("../config/database");
require("dotenv").config();

const app = express();
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

const authRoutes = require("../Routes/auth");

app.use("/", authRoutes);


connectDB().then(() => {
    app.listen(process.env.PORT || 7001, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
}).catch((err) => {
    console.log(err);
});


