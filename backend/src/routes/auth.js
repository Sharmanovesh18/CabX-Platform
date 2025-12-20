import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "../models/Users.js";

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    console.log("Registration request received:", req.body);
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required (name, email, phone, password)" });
    }

    // check if user exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("User registered successfully:", newUser.email);
    
    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, role: 'Passenger' }, JWT_SECRET, {
      expiresIn: '1h',
    });
    
    res.status(201).json({ 
      message: "User registered successfully", 
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: 'Passenger'
      },
      token
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    console.log("Login request received:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // find user by email
    const user = await Users.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("Login successful for user:", email);
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: 'Passenger' }, JWT_SECRET, {
      expiresIn: '1h',
    });
    
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: 'Passenger'
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error: " + error.message });
  }
});

export default router;
