const localRides = [
  {
    _id: "66d30d3ad4b0c9241c9d4a11",
    source: "Mumbai",
    destination: "Pune",
    date: "2025-09-25",
    time: "09:00",
    fare: 1500,
    driver: {
      name: "Ramesh Sharma",
      rating: 4.8,
      img: "https://via.placeholder.com/40"
    },
    vehicleType: "Sedan",
    remainingSeats: 3,
    stops: ["Pune"],
  },
  {
    _id: "66d30d3ad4b0c9241c9d4a12",
    source: "Mumbai",
    destination: "Pune",
    date: "2025-09-24",
    time: "14:00",
    fare: 1350,
    driver: {
      name: "Suman Das",
      rating: 4.5,
      img: "https://via.placeholder.com/40"
    },
    vehicleType: "SUV",
    remainingSeats: 2,
    stops: ["Pune"],
  },
  {
    _id: "66d30d3ad4b0c9241c9d4a13",
    source: "Mumbai",
    destination: "Nashik",
    date: "2025-09-23",
    time: "09:30",
    fare: 1200,
    driver: {
      name: "Ankit Jain",
      rating: 4.9,
      img: "https://via.placeholder.com/40"
    },
    vehicleType: "Hatchback",
    remainingSeats: 4,
    stops: ["Nashik"],
  },
  {
    _id: "66d30d3ad4b0c9241c9d4a14",
    source: "Delhi",
    destination: "Gurgaon",
    date: "2025-09-25",
    time: "18:00",
    fare: 450,
    driver: {
      name: "Priya Singh",
      rating: 4.7,
      img: "https://via.placeholder.com/40"
    },
    vehicleType: "Sedan",
    remainingSeats: 1,
    stops: ["Gurgaon"],
  },
  {
    _id: "66d30d3ad4b0c9241c9d4a15",
    source: "Rajpura",
    destination: "Chandigarh",
    date: "2025-09-24",
    time: "18:00",
    fare: 450,
    driver: {
      name: "Priya Singh",
      rating: 4.7,
      img: "https://via.placeholder.com/40"
    },
    vehicleType: "Sedan",
    remainingSeats: 1,
    stops: ["Chandigarh"],
  }
];

export default localRides;