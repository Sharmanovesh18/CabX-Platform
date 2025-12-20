import mongoose from "mongoose";
import Ride from "../models/Ride.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cab_booking";

const today = new Date().toISOString().slice(0, 10);
const rides = [
  {
    source: "Chandigarh",
    destination: "Mohali",
    date: today,
    time: "10:00",
    fare: 250,
    driver: {
      name: "Amit Kumar",
      phone: "9988776655",
      rating: 4.8
    },
    vehicleType: "Sedan",
    availableSeats: 3
  },
  {
    source: "Rajpura",
    destination: "Chandigarh",
    date: today,
    time: "13:00",
    fare: 500,
    driver: {
      name: "Sunil Verma",
      phone: "9876541230",
      rating: 4.7
    },
    vehicleType: "Scorpio",
    availableSeats: 4
  },
  {
    source: "Gumthala",
    destination: "Chandigarh",
    date: today,
    time: "12:00",
    fare: 300,
    driver: {
      name: "Bharat Singh",
      phone: "9876543210",
      rating: 4.6
    },
    vehicleType: "SUV",
    availableSeats: 4
  },
  {
    source: "Chandi",
    destination: "Chandi",
    date: today,
    time: "14:00",
    fare: 200,
    driver: {
      name: "Kasturi Lal",
      phone: "9999888777",
      rating: 4.9
    },
    vehicleType: "Hatchback",
    availableSeats: 2
  },
  {
    source: "Delhi",
    destination: "Mumbai",
    date: today,
    time: "09:00",
    fare: 1200,
    driver: {
      name: "Rajesh Sharma",
      phone: "9123456789",
      rating: 4.7
    },
    vehicleType: "Sedan",
    availableSeats: 3
  },
  {
    source: "Mumbai",
    destination: "Pune",
    date: today,
    time: "11:30",
    fare: 500,
    driver: {
      name: "Priya Patel",
      phone: "9876512345",
      rating: 4.8
    },
    vehicleType: "SUV",
    availableSeats: 4
  },
  {
    source: "Bangalore",
    // destination: "Chennai",
    date: today,
    time: "08:00",
    fare: 800,
    driver: {
      name: "Venkat Reddy",
      phone: "9988771234",
      rating: 4.5
    },
    vehicleType: "Sedan",
    availableSeats: 3
  }
];

async function seed() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await Ride.deleteMany({});
  await Ride.insertMany(rides);
  console.log("✅ Sample rides seeded");
  mongoose.disconnect();
}

seed();
