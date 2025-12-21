# Distance API Documentation

This document explains how to use the Distance API to calculate distances and fares between locations.

## Overview

The Distance API provides endpoints to:
- Calculate distance and fare between two locations
- Get distance for multiple routes at once
- Support for both Google Maps API (when configured) and approximate distances

## API Endpoints

### 1. Calculate Distance & Fare

**Endpoint:** `GET /api/distance/calculate`

**Query Parameters:**
- `source` (required) - Starting location name
- `destination` (required) - Ending location name
- `baseFare` (optional) - Base fare amount, default: 50
- `perKmRate` (optional) - Rate per kilometer, default: 15

**Example Request:**
```
GET http://localhost:5000/api/distance/calculate?source=Chandigarh&destination=Mohali&baseFare=50&perKmRate=15
```

**Response:**
```json
{
  "success": true,
  "source": "Chandigarh",
  "destination": "Mohali",
  "distance": 30,
  "distanceUnit": "km",
  "duration": 1800,
  "durationText": "30 min",
  "estimatedFare": 500,
  "fareDetails": {
    "baseFare": 50,
    "perKmRate": 15,
    "distance": 30
  }
}
```

### 2. Bulk Distance Calculation

**Endpoint:** `POST /api/distance/bulk`

**Request Body:**
```json
{
  "routes": [
    { "source": "Chandigarh", "destination": "Mohali" },
    { "source": "Delhi", "destination": "Gurgaon" },
    { "source": "Mumbai", "destination": "Pune" }
  ]
}
```

**Example Request:**
```javascript
fetch('http://localhost:5000/api/distance/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    routes: [
      { source: 'Chandigarh', destination: 'Mohali' },
      { source: 'Delhi', destination: 'Gurgaon' }
    ]
  })
})
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "source": "Chandigarh",
      "destination": "Mohali",
      "distance": 30,
      "durationText": "30 min",
      "estimatedFare": 500
    },
    {
      "source": "Delhi",
      "destination": "Gurgaon",
      "distance": 30,
      "durationText": "25 min",
      "estimatedFare": 500
    }
  ]
}
```

### 3. Simple Distance

**Endpoint:** `GET /api/distance/simple`

**Query Parameters:**
- `source` (required) - Starting location name
- `destination` (required) - Ending location name

**Example Request:**
```
GET http://localhost:5000/api/distance/simple?source=Chandigarh&destination=Mohali
```

**Response:**
```json
{
  "success": true,
  "source": "Chandigarh",
  "destination": "Mohali",
  "distance": 30,
  "unit": "km"
}
```

## Frontend Usage

### Setup

Import the distance service in your component:

```javascript
import { getDistanceAndFare, formatDistance, formatFare } from '../services/distanceService';
```

### Example 1: Get Distance for a Ride

```javascript
const handleCalculateDistance = async () => {
  try {
    const data = await getDistanceAndFare('Chandigarh', 'Mohali');
    console.log(`Distance: ${data.distance} km`);
    console.log(`Estimated Fare: ₹${data.estimatedFare}`);
    console.log(`Duration: ${data.durationText}`);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Example 2: Display Distance in a Ride Card

```javascript
const RideCard = ({ ride }) => {
  const [distanceData, setDistanceData] = useState(null);

  useEffect(() => {
    const fetchDistance = async () => {
      try {
        const data = await getDistanceAndFare(ride.source, ride.destination);
        setDistanceData(data);
      } catch (error) {
        console.error('Error fetching distance:', error);
      }
    };

    fetchDistance();
  }, [ride]);

  return (
    <div className="ride-card">
      <p>From: {ride.source}</p>
      <p>To: {ride.destination}</p>
      {distanceData && (
        <>
          <p>Distance: {formatDistance(distanceData.distance)}</p>
          <p>Duration: {distanceData.durationText}</p>
          <p>Fare: {formatFare(distanceData.estimatedFare)}</p>
        </>
      )}
    </div>
  );
};
```

### Example 3: Calculate Distances for Multiple Rides

```javascript
import { getBulkDistances } from '../services/distanceService';

const handleGetMultipleDistances = async (rides) => {
  try {
    const routes = rides.map(ride => ({
      source: ride.source,
      destination: ride.destination
    }));
    
    const distanceData = await getBulkDistances(routes);
    console.log('All distances calculated:', distanceData);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## How to Integrate into DashBoard Component

In your `DashBoard.jsx`, you can use the distance API like this:

```javascript
import { getDistanceAndFare } from '../services/distanceService';

const DashBoard = () => {
  const [rides, setRides] = useState([]);

  const handleSearch = async () => {
    try {
      // ... existing search code ...
      
      // Fetch distances for all rides
      if (rides.length > 0) {
        const routesWithDistance = await Promise.all(
          rides.map(async (ride) => {
            const distanceData = await getDistanceAndFare(
              ride.source,
              ride.destination
            );
            return {
              ...ride,
              distance: distanceData.distance,
              duration: distanceData.durationText,
              estimatedFare: distanceData.estimatedFare
            };
          })
        );
        setRides(routesWithDistance);
      }
    } catch (error) {
      console.error('Error fetching distances:', error);
    }
  };

  return (
    // ... rest of component
  );
};
```

## Supported Locations

The API supports distance calculations for these common routes:
- Chandigarh ↔ Mohali (30 km)
- Chandigarh ↔ Rajpura (45 km)
- Chandigarh ↔ Gumthala (40 km)
- Delhi ↔ Mumbai (1400 km)
- Mumbai ↔ Pune (150 km)
- Delhi ↔ Gurgaon (30 km)
- Delhi ↔ Noida (25 km)
- Bangalore ↔ Hyderabad (560 km)
- Mumbai ↔ Nashik (180 km)
- And more...

## Google Maps API Integration (Optional)

To use real-time distances from Google Maps:

1. **Get API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the "Distance Matrix API" and "Maps API"
   - Create an API key

2. **Configure Environment Variable:**
   ```bash
   # In your .env file
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

3. **Restart Backend:**
   ```bash
   npm start
   ```

## Fare Calculation Formula

```
Fare = Base Fare + (Distance in km × Per KM Rate)
```

Default values:
- Base Fare: ₹50
- Per KM Rate: ₹15

Example:
- Distance: 30 km
- Base Fare: ₹50
- Per KM Rate: ₹15
- **Total Fare = ₹50 + (30 × ₹15) = ₹500**

## Error Handling

All endpoints return appropriate error responses:

```json
{
  "error": "Invalid request",
  "message": "source and destination are required"
}
```

## Best Practices

1. **Cache Results:** Store distance data to avoid repeated API calls
2. **Batch Requests:** Use the bulk endpoint for multiple routes
3. **Handle Errors:** Always wrap API calls in try-catch blocks
4. **Show Loading States:** Display loading indicators while fetching data
5. **Format Output:** Use helper functions like `formatDistance()` and `formatFare()`

## Troubleshooting

### "Distance calculation failed"
- Check if the source and destination locations are valid
- Ensure the backend server is running
- Check console logs for detailed error messages

### Inaccurate Distances
- If Google Maps API key is not configured, the system uses approximate distances
- Add a valid Google Maps API key for accurate real-time distances
- Check that the API has Distance Matrix API enabled

### CORS Errors
- Ensure your frontend is on the same domain or CORS is properly configured
- Check that the backend has CORS enabled: `app.use(cors())`

## Updating seedRides.js with Distance Data

You can update your seed rides to include distance information:

```javascript
const rides = [
  {
    source: "Chandigarh",
    destination: "Mohali",
    date: today,
    time: "10:00",
    fare: 250,
    distance: 30,  // Add this
    duration: "30 min",  // Add this
    driver: { ... },
    vehicleType: "Sedan",
    availableSeats: 3
  },
  // ... more rides
];
```

Then update your Ride model to include these fields:

```javascript
const rideSchema = new mongoose.Schema({
  source: { type: String, required: true },
  destination: { type: String, required: true },
  distance: { type: Number }, // Add this
  duration: { type: String }, // Add this
  // ... rest of fields
});
```
