import express from 'express';
import Ride from '../models/Ride.js';
import Users from '../models/Users.js';
import Booking from '../models/Booking.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { source, destination, date, time, fare, driver, vehicleType, remainingSeats } = req.body;
    const newRide = new Ride({
      source,
      destination,
      date,
      time,
      fare,
      driver,
      vehicleType,
      remainingSeats
    });
    await newRide.save();
    res.status(201).json(newRide);
  } catch (err) {
    console.error("Error creating ride:", err);
    res.status(500).send("Failed to create ride.");
  }
});

// Get co-passengers for a specific ride (people who have booked the same route)
router.get('/:rideId/co-passengers', async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await Ride.findById(rideId);
    
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found', passengers: [] });
    }

    // Find all bookings for this specific ride
    const bookings = await Booking.find({ rideId }).populate('userId', 'name phone email');

    // Format passenger data
    const passengers = bookings
      .filter(booking => booking.userId) // Ensure userId exists
      .map(booking => ({
        _id: booking.userId._id,
        name: booking.userId.name || 'Passenger',
        phone: booking.userId.phone || 'Not available',
        email: booking.userId.email,
        source: booking.source || ride.source,
        destination: booking.destination || ride.destination,
        pickupLocation: booking.pickupLocation || booking.source || ride.source,
        dropLocation: booking.dropLocation || booking.destination || ride.destination,
        bookingId: booking._id
      }));

    res.json({ passengers, count: passengers.length });
  } catch (err) {
    console.error('Error fetching co-passengers:', err);
    res.status(500).json({ message: 'Failed to fetch co-passengers', passengers: [] });
  }
});

export default router;

// Add booking endpoint here to ensure /api/rides/book is available via the rides router too
router.post('/book', async (req, res) => {
  let { rideId } = req.body;
  let userId = null;
  // prefer token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      console.warn('Invalid token in rides router /book:', err?.message || err);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } else if (req.body.token) {
    try {
      const decoded = jwt.verify(req.body.token, JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      console.warn('Invalid token provided in body to /api/rides/book:', err?.message || err);
    }
  }
  if (!userId && req.body.userId) userId = req.body.userId;

  try {
    const ride = await Ride.findById(rideId);
    let user = await Users.findById(userId);
    // Auto-provision missing user in development if configured
    if (!user && process.env.AUTO_PROVISION === 'true' && userId) {
      try {
        console.log('Auto-provisioning missing user in rideRoutes:', userId);
        user = await Users.create({ _id: userId, name: 'AutoProvisioned User', email: `autouser+${userId}@local`, phone: '' });
      } catch (err) {
        console.error('Auto-provision failed in rideRoutes:', err);
      }
    }
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (!user) return res.status(404).json({ message: 'User not found', userId });
    if (ride.remainingSeats <= 0) return res.status(400).json({ message: 'No seats available' });

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
      driver: ride.driver,
      shareRide: shareRide || false,
      coPassengers: coPassengers || []
    });
    await booking.save();

    res.json({ message: 'Ride booked', booking, ride: { source: ride.source, destination: ride.destination, fare: ride.fare, driver: ride.driver, remainingSeats: ride.remainingSeats } });
  } catch (err) {
    console.error('Error in /api/rides/book (router):', err?.message || err);
    res.status(500).json({ message: 'Booking failed', error: err?.message || String(err) });
  }
});