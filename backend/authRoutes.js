const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./Users");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    console.log('Register request for:', req.body.username);
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashed });
    await user.save();
    res.json({ message: "User registered" });
  } catch (err) {
    console.error('Register error:', err.message || err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Username already taken' });
    }
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post("/login", async (req, res) => {
  try {
    console.log('Login request for:', req.body.username);
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err.message || err);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
