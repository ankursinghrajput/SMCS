const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/user");
require("dotenv").config();

// Default admin credentials
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME;
const ADMIN_CONTACT = process.env.ADMIN_CONTACT;    

const seedAdmin = async () => {
    try {
        if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_NAME || !ADMIN_CONTACT) {
            console.error("Missing required environment variables for seeding the admin.");
            process.exit(1);
        }

        const mongoURI = process.env.MONGODB_URL;
        await mongoose.connect(mongoURI);
        console.log("Connected to database.");

        const existingAdmin = await User.findOne({ email: ADMIN_EMAIL, role: "admin" });
        if (existingAdmin) {
            console.log("Admin user already exists. Exiting.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        const adminUser = new User({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            contactNumber: ADMIN_CONTACT,
            role: "admin"
        });

        await adminUser.save();
        console.log(`Admin user successfully created!`);
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);
        console.log("You can change these in your .env file or database later.");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding admin user:", error);
        process.exit(1);
    }
};  

seedAdmin();
