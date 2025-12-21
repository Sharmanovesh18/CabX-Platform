# Real-Time Place Search API - Complete Setup Guide

This guide explains how to implement real-time place search in your cab booking application. Users can now search for any location, not just predefined demo places.

## What's Included

### ✅ Features
- **Real-time autocomplete** - Search suggestions as users type
- **Multiple API support** - Free (OpenStreetMap) and Premium (Google Places)
- **Popular cities** - Quick suggestions for major Indian cities
- **Keyboard navigation** - Arrow keys, Enter, Escape support
- **Mobile responsive** - Works seamlessly on all devices
- **No API key required** (for free version)

---

## API Options

### Option 1: OpenStreetMap Nominatim (FREE ✅ Recommended)
- **Cost**: Free
- **Coverage**: Global, including all Indian cities
- **Rate limit**: 1 request/second (sufficient for most apps)
- **No API key needed**

### Option 2: Google Places API (Premium 💰)
- **Cost**: $0.017 per request + setup costs
- **Coverage**: Comprehensive, highly accurate
- **Requires**: Google Maps API key
- **Better for**: High-traffic production apps

---

## Backend Setup

### Files Created

#### 1. **Place Routes** - `/backend/src/routes/placeRoutes.js`
Provides 4 API endpoints:

```javascript
GET /api/places/search
GET /api/places/popular
GET /api/places/autocomplete
POST /api/places/batch-search
```

#### 2. **Updated app.js**
Added place routes to your backend:

```javascript
import placeRoutes from "./src/routes/placeRoutes.js";
app.use("/api/places", placeRoutes);
```

---

## Frontend Setup

### Files Created

#### 1. **Place Search Service** - `/frontend/src/services/placeSearchService.js`
Reusable functions:

```javascript
// Search any location
await searchPlaces("Delhi")

// Get popular cities
popularCities // Array of major Indian cities

// Format place names
formatPlaceName(place)
```

#### 2. **PlaceSearchInput Component** - `/frontend/src/components/PlaceSearchInput.jsx`
Ready-to-use autocomplete input:

```jsx
<PlaceSearchInput
  label="From"
  placeholder="Enter pickup location"
  value={start}
  onChange={setStart}
  onSelectPlace={setStartPlaceData}
/>
```

#### 3. **Styling** - `/frontend/src/components/PlaceSearchInput.css`
Complete dark theme styling matching your design

---

## API Endpoints

### 1. Search Places
**GET** `/api/places/search?q=delhi&limit=10`

**Response:**
```json
{
  "success": true,
  "query": "delhi",
  "count": 3,
  "results": [
    {
      "id": 123,
      "name": "Delhi",
      "displayName": "Delhi, India",
      "latitude": 28.7041,
      "longitude": 77.1025,
      "address": {
        "city": "Delhi",
        "state": "Delhi",
        "country": "India"
      }
    }
  ]
}
```

### 2. Get Popular Cities
**GET** `/api/places/popular`

**Response:**
```json
{
  "success": true,
  "count": 15,
  "cities": [
    {
      "name": "Delhi",
      "state": "Delhi",
      "latitude": 28.7041,
      "longitude": 77.1025
    },
    {
      "name": "Mumbai",
      "state": "Maharashtra",
      "latitude": 19.0760,
      "longitude": 72.8777
    }
    // ... more cities
  ]
}
```

### 3. Autocomplete
**GET** `/api/places/autocomplete?input=de&limit=5`

Quick suggestions as user types.

### 4. Batch Search
**POST** `/api/places/batch-search`

```json
{
  "queries": ["Delhi", "Mumbai", "Bangalore"]
}
```

---

## Integration Steps

### Step 1: Update DashBoard.jsx

Replace your input fields with PlaceSearchInput:

```jsx
import PlaceSearchInput from './PlaceSearchInput';

const DashBoard = () => {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [startPlaceData, setStartPlaceData] = useState(null);
  const [destinationPlaceData, setDestinationPlaceData] = useState(null);

  return (
    <div className="dashboard-form-controls">
      <PlaceSearchInput
        label="From"
        placeholder="Enter pickup location"
        value={start}
        onChange={setStart}
        onSelectPlace={setStartPlaceData}
      />

      {/* Swap Button */}
      <button
        className="swap-icon"
        onClick={() => {
          setStart(destination);
          setDestination(start);
        }}
      >
        ⇅
      </button>

      <PlaceSearchInput
        label="To"
        placeholder="Enter dropoff location"
        value={destination}
        onChange={setDestination}
        onSelectPlace={setDestinationPlaceData}
      />

      {/* Date and Time inputs */}
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

      <button onClick={handleSearch}>Search Rides</button>
    </div>
  );
};
```

### Step 2: Use Place Data (Optional)

If you want to store coordinates for distance calculations:

```jsx
const handleSelectPlace = (placeData) => {
  console.log("Selected place:", placeData);
  // Store latitude and longitude for distance calculation
  // placeData.latitude, placeData.longitude
};
```

### Step 3: Add CSS Import

In your DashBoard.jsx:

```jsx
import PlaceSearchInput from './PlaceSearchInput';
// CSS is automatically imported by the component
```

---

## Frontend Service Usage

### Basic Search

```javascript
import { searchPlaces, formatPlaceName } from '../services/placeSearchService';

// Search for a location
const results = await searchPlaces("Mumbai");
console.log(results);
// Output: Array of place suggestions
```

### Popular Cities

```javascript
import { popularCities } from '../services/placeSearchService';

console.log(popularCities);
// Output: Array of 15 major Indian cities
```

### Get Place Details

```javascript
import { getPlaceDetails } from '../services/placeSearchService';

const placeDetails = await getPlaceDetails("Delhi");
console.log(placeDetails.latitude, placeDetails.longitude);
```

### Debounced Search

```javascript
import { searchPlacesDebounced } from '../services/placeSearchService';

// Search with 500ms debounce
const results = await searchPlacesDebounced("Delhi", 500);
```

---

## Configuration Options

### Free (OpenStreetMap) - Default ✅

No configuration needed! Works out of the box.

### Premium (Google Places) 💰

#### Get Google API Key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Places API
   - Distance Matrix API
   - Maps JavaScript API
4. Create an API key (Restricted to Web Apps)

#### Add to Frontend:

Create `.env` file in `/frontend`:

```bash
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

#### Update Component:

```jsx
import { searchPlacesGoogle } from '../services/placeSearchService';

// Use Google Places instead
const results = await searchPlacesGoogle("Mumbai");
```

---

## Features Explained

### 🔍 Real-time Search
- Searches as user types
- 300ms debounce to prevent excessive requests
- Minimum 2 characters required for search

### ⌨️ Keyboard Navigation
- **↓** - Move down in suggestions
- **↑** - Move up in suggestions
- **Enter** - Select highlighted suggestion
- **Escape** - Close dropdown
- **Tab** - Move to next field

### 🎯 Click Outside
- Dropdown closes when clicking outside
- User input is retained

### 📍 Location Details
- Full address information
- Latitude/Longitude coordinates
- City, state, country
- Postal code

### 🚀 Performance
- Debounced API calls
- Caching of results (via browser cache)
- Minimal bundle size
- No external UI library required

---

## Customization

### Change Placeholder Text

```jsx
<PlaceSearchInput
  placeholder="Where are you going?"
  label="Destination"
  ...
/>
```

### Custom Styling

Override CSS in your own stylesheet:

```css
.place-search-input {
  background-color: #fff;
  color: #000;
  border-color: #ccc;
}

.place-search-input:focus {
  border-color: #007bff;
}

.place-search-suggestions {
  background-color: #fff;
  color: #000;
}
```

### Handle Place Selection

```jsx
const handleSelectPlace = (placeData) => {
  console.log({
    name: placeData.name,
    latitude: placeData.latitude,
    longitude: placeData.longitude,
    address: placeData.address
  });
  
  // Use this data for:
  // - Distance calculation
  // - Map integration
  // - Database storage
};

<PlaceSearchInput
  onSelectPlace={handleSelectPlace}
  ...
/>
```

---

## Error Handling

The component handles errors gracefully:

```javascript
try {
  const results = await searchPlaces(query);
} catch (error) {
  console.error("Search failed:", error);
  // Shows "No places found" message
}
```

---

## Supported Locations

Works with:
- ✅ Cities (Delhi, Mumbai, Bangalore)
- ✅ States (Maharashtra, Karnataka)
- ✅ Localities (Connaught Place, Bandra)
- ✅ Landmarks (India Gate, CST)
- ✅ Roads and streets
- ✅ Pin codes

---

## Next Steps

### 1. Integrate with Distance API
```javascript
import { getDistanceAndFare } from '../services/distanceService';

const distanceData = await getDistanceAndFare(start, destination);
// Combines place search + distance calculation
```

### 2. Store Location Coordinates
```javascript
// Save startPlaceData and destinationPlaceData in your database
const booking = {
  startLocation: {
    name: start,
    latitude: startPlaceData.latitude,
    longitude: startPlaceData.longitude
  },
  destinationLocation: {
    name: destination,
    latitude: destinationPlaceData.latitude,
    longitude: destinationPlaceData.longitude
  }
};
```

### 3. Add Map Display
```javascript
// Use coordinates with any map library (Google Maps, Mapbox, Leaflet)
showMapRoute(
  startPlaceData.latitude,
  startPlaceData.longitude,
  destinationPlaceData.latitude,
  destinationPlaceData.longitude
);
```

---

## Troubleshooting

### "No places found"
- Check internet connection
- Ensure location name is correct
- Try full city name (e.g., "New Delhi" instead of "ND")

### Dropdown not showing
- Make sure input is focused (click on input field)
- Check that search query is at least 2 characters

### Slow suggestions
- This is normal for first request
- Results are cached by browser
- Consider adding Google Places for faster responses

### CORS Errors
- Ensure backend is running on `http://localhost:5000`
- Check CORS is enabled in app.js: `app.use(cors())`

---

## Performance Tips

1. **Cache Results**
```javascript
const cache = {};
const searchWithCache = async (query) => {
  if (cache[query]) return cache[query];
  const results = await searchPlaces(query);
  cache[query] = results;
  return results;
};
```

2. **Debounce Search**
Already implemented in PlaceSearchInput component.

3. **Limit Results**
```javascript
// Only get top 5 suggestions
const results = await searchPlaces(query);
const top5 = results.slice(0, 5);
```

4. **Use Batch Search for Multiple Locations**
```javascript
const results = await fetch('/api/places/batch-search', {
  method: 'POST',
  body: JSON.stringify({
    queries: ['Delhi', 'Mumbai', 'Bangalore']
  })
});
```

---

## Demo Cities

These 15 cities work great with the system:
- Delhi, Mumbai, Bangalore, Hyderabad, Chennai
- Kolkata, Pune, Ahmedabad, Jaipur, Chandigarh
- Gurgaon, Noida, Indore, Kochi, Surat

Try searching for them or any other Indian city!

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify backend is running: `npm start`
3. Check browser console for errors
4. Ensure frontend is using correct API URL: `http://localhost:5000`
