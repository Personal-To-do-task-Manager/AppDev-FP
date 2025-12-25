require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./authRoutes");
const taskRoutes = require("./taskRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

console.log('Attempting MongoDB connection to:', process.env.MONGODB_URI);
mongoose.set('debug', true);
// enable debug logging for mongoose to help surface connection activity
// note: this will print Mongoose operations to the console
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message || err);
    process.exit(1);
  });
