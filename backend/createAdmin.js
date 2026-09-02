const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const existingAdmin = await Admin.findOne({
            adminId: "admin001"
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            await mongoose.disconnect();
            return;
        }

        const hashedPassword = await bcrypt.hash(
            "Admin@123",
            10
        );

        const admin = new Admin({
            adminId: "admin001",
            password: hashedPassword
        });

        await admin.save();

        console.log("Admin created successfully");

        await mongoose.disconnect();

    } catch (error) {
        console.log("Error:", error.message);
    }
}

createAdmin();