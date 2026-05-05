import Users from "../src/models/Users.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET || 'car_pooling_secret_key_2024';

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const userExists = await Users.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new Users({
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || 'User'
        });

        await user.save();

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Saarthi - Registration Successful',
            text: `Thank you, ${name}, you are successfully registered with Saarthi!`
        };
        
        transporter.sendMail(mailOptions).catch(err => console.error('Email error:', err));

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: "User registered successfully!",
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // If user exists but doesn't have a password (social login user)
        if (!user.password) {
            return res.status(400).json({ message: 'This account uses social login. Please sign in with Google/GitHub.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Send login notification email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Login Successful - Saarthi',
            text: `Hello ${user.name}, you have successfully logged into your Saarthi account.`
        };
        
        transporter.sendMail(mailOptions).catch(err => console.error('Email error:', err));

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful!',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};