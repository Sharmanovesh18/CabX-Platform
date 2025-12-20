import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import http from "http";
import { Server } from "socket.io";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from 'crypto';
import Razorpay from 'razorpay';

import localRides from "./src/data/localRides.js";
import Ride from "./src/models/Ride.js";
import Booking from "./src/models/Booking.js";
import Users from "./src/models/Users.js"; // This is the updated import
import LegacyUser from "./models/User.js"; // Legacy/alternate user model (compat)

import rideRoutes from "./src/routes/rideRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import Location from "./src/models/Location.js";

import userRoutes from "./routes/userRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import connectDB from "./config/db.js";




// Explicitly resolve .env relative to this file so env vars load even when
// the process is started from a different working directory.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

console.log('Loaded env from:', envPath);
console.log('Razorpay key id present:', !!process.env.RAZORPAY_KEY_ID);
console.log('Razorpay key secret present:', !!process.env.RAZORPAY_KEY_SECRET);
// Consolidate JWT secret usage (fallback for local dev)
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

const app = express();
// Explicit CORS policy: allow Authorization header and JSON content-type
app.use(cors({
  origin: true,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Authorization"],
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- REAL AUTH0 CONFIGURATION NOTE ---
// For a real deployment, you would need to install:
// npm install express-oauth2-jwt-bearer jwks-rsa
// to securely verify the JWT Access Token issued by Auth0.

// DB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Note: useCreateIndex and useFindAndModify are deprecated and removed in Mongoose 6+
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// Initial data seeding function
const seedData = async () => {
  try {
    await Ride.deleteMany({});
    await Booking.deleteMany({});
    await Users.deleteMany({}); // Changed to Users
    await Ride.insertMany(localRides);
    console.log("✅ Database seeded with initial data.");

    // Create a sample user for testing
    const sampleUserEmail = "johndoe@example.com";
    const sampleUserPassword = "password123";

    // Hash the password for the sample user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(sampleUserPassword, salt);

    // Create a new sample user with all required fields
    const sampleUser = new Users({ // Changed to Users
        _id: "66d30d3ad4b0c9241c9d4a11",
        name: "John Doe",
        email: sampleUserEmail,
        phone: "123-456-7890",
        password: hashedPassword,
    });

    await sampleUser.save();
    console.log("✅ Sample user created.");
  } catch (err) {
    console.error("❌ Error seeding data:", err);
  }
};

app.use('/api/users', userRoutes);
// Reviews API
app.use('/api/reviews', reviewRoutes);

// Payments: create Razorpay order and verify signature
app.post('/api/payments/create-order', async (req, res) => {
  const { amount, bookingId } = req.body;
  if (!amount) return res.status(400).json({ message: 'Amount required' });

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return res.status(500).json({ message: 'Payment keys not configured' });

  try {
    const razorpay = new Razorpay({ key_id, key_secret });
    const order = await razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${bookingId || 'manual'}_${Date.now()}`,
    });
    res.json({ order, key_id });
  } catch (err) {
    console.error('Razorpay create order error', err);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

app.post('/api/payments/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) return res.status(500).json({ message: 'Payment secret not configured' });
  try {
    const generated_signature = crypto.createHmac('sha256', key_secret).update(razorpay_order_id + '|' + razorpay_payment_id).digest('hex');
    if (generated_signature === razorpay_signature) {
      // Optionally mark booking as paid in DB here (bookingId)
      return res.json({ success: true });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (err) {
    console.error('Verify payment error', err);
    res.status(500).json({ message: 'Failed to verify payment' });
  }
});

// --- AUTH0 SYNCHRONIZATION MIDDLEWARE (MOCK) ---
// This mock simulates verifying the Auth0 Access Token and extracting the user ID.
const mockVerifyAuth0Token = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Auth0 Access Token required" });
    }

    const token = authHeader.split(" ")[1];
    let auth0_sub; // This is the unique user ID (sub claim) from Auth0

    // MOCK: In production, this logic would be replaced by JWT verification middleware
    if (token === "mock-valid-token-passenger") {
        auth0_sub = "auth0|mock-passenger-123"; 
    } else if (token === "mock-valid-token-driver") {
        auth0_sub = "auth0|mock-driver-456";
    } else {
         return res.status(401).json({ message: "Invalid or expired Auth0 token (Mocked)" });
    }

    req.auth0_sub = auth0_sub; // Attach Auth0 ID to the request
    next();
};

// --- NEW ROUTE: Sync Social Login User Data ---
app.post("/api/auth/sync-social", mockVerifyAuth0Token, async (req, res) => {
    /**
     * This endpoint is called by the frontend immediately after a successful Auth0 login.
     * It uses the verified Auth0 ID to find or create the user in the MongoDB database,
     * ensuring their role is assigned and profile data is synchronized.
     */
    const { email, name, role } = req.body;
    const auth0_user_id = req.auth0_sub; // Extracted from the validated Auth0 token

    if (!email || !name || !role) {
        return res.status(400).json({ message: "Missing profile data (email, name, role)" });
    }

    try {
        // Find user by Auth0 ID OR Email (to link accounts if the email already exists)
        const user = await Users.findOneAndUpdate(
            { $or: [{ auth0_id: auth0_user_id }, { email: email }] },
            {
                $set: {
                    name,
                    email,
                    app_role: role, // Save the selected role (Passenger/Driver)
                    auth0_id: auth0_user_id, // Ensure the Auth0 ID is set
                    last_login: Date.now(),
                },
                // We intentionally do NOT overwrite the 'password' field if it exists
                // The 'password' field is used only by the manual login flow.
            },
            { 
                new: true, // Return the updated document
                upsert: true, // Create the document if it doesn't exist
                runValidators: true // Ensure validation runs on updates
            }
        ).select("-password");

        // The user is now logged in via Auth0 and synchronized in the database.
        // We generate a local JWT for application usage based on the MongoDB user ID.
        const token = jwt.sign({ id: user._id, role: user.app_role }, JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({
            message: `User synchronized and logged in as ${user.app_role}!`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.app_role,
            },
            token,
        });

    } catch (err) {
        console.error("❌ Auth0 Sync error:", err);
        res.status(500).json({ message: "Server error during user synchronization" });
    }
});


// User registration route (MANUAL AUTH - KEPT)
app.post("/api/auth/register", async (req, res) => {
  const { name, email, phone, password } = req.body;
  // Basic input validation
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Missing required fields: name, email, phone, password' });
  }
  try {
    const userExists = await Users.findOne({ email }); // Changed to Users
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new Users({ // Changed to Users
      name,
      email,
      phone,
      password: hashedPassword,
      app_role: 'Passenger' // Default role for manual sign up
    });
    await user.save();
    // Generate JWT for the newly created user
    const token = jwt.sign({ id: user._id, role: user.app_role }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Return user profile (without password) and token
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.app_role,
    };

    res.status(201).json({ message: "User registered successfully!", user: userProfile, token });
  } catch (err) {
    console.error("❌ Registration error:", err);
    if (err.code === 11000) {
      // duplicate key
      return res.status(400).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// User login route (MANUAL AUTH - KEPT)
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Login attempt for:', email);
    let user = await Users.findOne({ email }); // first try main Users collection
    let usedModel = 'Users';

    // If not found, try the legacy User model (different schema/collection)
    if (!user) {
      const legacy = await LegacyUser.findOne({ email });
      if (legacy) {
        user = legacy;
        usedModel = 'LegacyUser';
        console.log('Found user in legacy collection for:', email);
      }
    }

    if (!user) {
      console.log('User not found in any collection:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for user (model=' + usedModel + '):', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id, role: user.app_role || 'Passenger' }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Normalize name field across different models
    const displayName = user.name || [user.given_name, user.family_name].filter(Boolean).join(' ') || '';

    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user._id,
        name: displayName,
        email: user.email,
        role: user.app_role || user.role || 'Passenger',
      },
      token,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Middleware to protect routes (optional but recommended)
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    // Note: The token now includes the user's role
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.id;
    req.role = decoded.role; // Extract role from JWT
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Protected route to get user profile (KEPT)
app.get("/api/auth/profile", protect, async (req, res) => {
  try {
    const user = await Users.findById(req.user).select("-password"); // Changed to Users
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Search route (KEPT)
app.get("/api/rides/search", async (req, res) => {
  const { source, destination, date } = req.query;

  const now = new Date();
  const searchDate = date ? new Date(date) : null;

  // Check if date is in the past
  if (searchDate && searchDate < now.setHours(0, 0, 0, 0)) {
    return res.status(200).json({
      results: [],
      message: "Cannot search for past dates.",
    });
  }

  try {
    const localMatches = localRides.filter((ride) => {
      const isMatch =
        ride.source.toLowerCase() === source.toLowerCase() &&
        ride.destination.toLowerCase() === destination.toLowerCase() &&
        (ride.date === date || !date);
      return isMatch;
    });

    if (localMatches.length > 0) {
      return res.status(200).json({ results: localMatches });
    }

    const query = {
      source: { $regex: new RegExp(`^${source}$`, "i") },
      destination: { $regex: new RegExp(`^${destination}$`, "i") },
    };
    if (date) {
      query.date = date;
    }

    const dbRides = await Ride.find(query);

    if (dbRides.length > 0) {
      return res.status(200).json({ results: dbRides });
    }

    res.status(200).json({ results: [], message: "No rides found." });
  } catch (err) {
    console.error("❌ Error searching for rides:", err);
    res.status(500).json({ error: "Failed to search for rides" });
  }
});

// Book route (KEPT)
app.post("/api/rides/book", async (req, res) => {
  let { rideId } = req.body;
  let userId = null;
  console.log('Booking request received:', { rideId });
  // Prefer to derive userId from Authorization token (trusted source).
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
      console.log('Derived userId from token:', userId);
    } catch (err) {
      console.warn('Failed to verify token for booking (Authorization header present):', err?.message || err);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } else if (req.body.token) {
    // Accept token in body for non-browser clients (fallback)
    try {
      const decoded = jwt.verify(req.body.token, JWT_SECRET);
      userId = decoded.id;
      console.log('Derived userId from body.token fallback:', userId);
    } catch (err) {
      console.warn('Failed to verify token from body for booking:', err?.message || err);
    }
  }
  // If still no userId, allow deprecated body.userId fallback but log a warning.
  if (!userId && req.body.userId) {
    userId = req.body.userId;
    console.log('Falling back to body.userId for booking (deprecated):', userId);
  }
  try {
    const ride = await Ride.findById(rideId);
    let user = await Users.findById(userId); // Changed to Users
    // Auto-provision missing user in development if configured (use with caution)
    if (!user && process.env.AUTO_PROVISION === 'true' && userId) {
      try {
        console.log('Auto-provisioning missing user:', userId);
        user = await Users.create({ _id: userId, name: 'AutoProvisioned User', email: `autouser+${userId}@local`, phone: '' });
        console.log('Auto-provisioned user created:', user._id);
      } catch (provErr) {
        console.error('Auto-provision failed:', provErr);
      }
    }

    if (!ride) {
      console.warn('Booking failed: ride not found', rideId);
      return res.status(404).json({ message: 'Ride not found', rideId });
    }

    if (!user) {
      console.warn('Booking failed: user not found', userId);
      // If token decoded to an id that's not in our DB, instruct client to re-login.
      return res.status(401).json({ message: 'Authenticated user not found. Please sign out and sign in again.' });
    }

    if (ride.remainingSeats <= 0) {
      console.warn('Booking failed: no seats', rideId);
      return res.status(400).json({ message: 'No seats available for this ride' });
    }

    ride.remainingSeats -= 1;
    await ride.save();

    // Extract co-passenger preferences from request
    const { shareRide, coPassengers } = req.body;

    const booking = new Booking({
      userId,
      rideId,
      source: ride.source,
      destination: ride.destination,
      fare: ride.fare,
      driver: {
        name: ride.driver.name,
        rating: ride.driver.rating,
      },
      shareRide: shareRide || false,
      coPassengers: coPassengers || []
    });
    await booking.save();

    res.status(200).json({
      message: 'Ride booked successfully',
      booking,
      ride: {
        source: ride.source,
        destination: ride.destination,
        fare: ride.fare,
        driver: ride.driver,
        remainingSeats: ride.remainingSeats,
      },
    });
  } catch (err) {
    console.error('❌ Error booking ride:', err?.message || err);
    res.status(500).json({ message: 'Failed to book ride', error: err?.message || String(err) });
  }
});

// Other API Routes (KEPT)
app.use("/api/rides", rideRoutes);
app.use("/api", bookingRoutes);

// Socket.io for live location (KEPT)
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
  // Add your socket handlers here
  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  seedData();
});

// Diagnostic endpoint: check if Razorpay keys are present (DOES NOT RETURN SECRET)
app.get('/api/payments/config', (req, res) => {
  const hasKeyId = !!process.env.RAZORPAY_KEY_ID;
  const hasKeySecret = !!process.env.RAZORPAY_KEY_SECRET;
  res.json({ configured: hasKeyId && hasKeySecret, hasKeyId, hasKeySecret, key_id: process.env.RAZORPAY_KEY_ID || null });
});

// DEBUG: whoami - decode token and check user existence (for debugging only)
app.get('/api/debug/whoami', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const uid = decoded.id;
    const user = await Users.findById(uid).select('-password');
    return res.json({ ok: true, decoded, user: user ? { id: user._id, name: user.name, email: user.email, phone: user.phone } : null });
  } catch (err) {
    return res.status(400).json({ ok: false, message: 'Invalid token', error: err.message });
  }
});

// DEV: list all users (safe for local debugging only)
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await Users.find().select('_id name email phone');
    res.json({ ok: true, count: users.length, users });
  } catch (err) {
    console.error('Error fetching users for debug:', err);
    res.status(500).json({ ok: false, message: 'Failed to fetch users' });
  }
});

// DEV: get one user by id
app.get('/api/debug/users/:id', async (req, res) => {
  try {
    const u = await Users.findById(req.params.id).select('_id name email phone');
    if (!u) return res.status(404).json({ ok: false, message: 'User not found' });
    res.json({ ok: true, user: u });
  } catch (err) {
    console.error('Error fetching user by id for debug:', err);
    res.status(500).json({ ok: false, message: 'Failed to fetch user' });
  }
});