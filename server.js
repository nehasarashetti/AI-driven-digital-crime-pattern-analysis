const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Crime = require("./models/Crime");
const authRoutes = require("./routes/authRoutes");
const crimeRoutes = require("./routes/crimeRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const analysisRoutes = require("./routes/analysisRoutes");


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(
  "/api/crimes",
  authMiddleware,
  crimeRoutes
);
app.use("/api/analysis",
  analysisRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.log(err));

app.get("/", (req, res) => {
    res.send("AI Crime Pattern Analysis Backend is Running!");
});
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});