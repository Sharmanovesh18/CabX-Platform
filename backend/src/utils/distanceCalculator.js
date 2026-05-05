import axios from 'axios';

/**
 * Get real-time distance and duration from Google Maps Distance Matrix API
 * @param {string} source - Origin address or coordinates
 * @param {string} destination - Destination address or coordinates
 * @returns {Promise<Object>} Object containing distance (km) and duration (seconds/text)
 */
export const getDistanceAndDuration = async (source, destination) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey || apiKey === 'your_google_maps_api_key') {
    // Fallback if API key is not configured (mock data for demo)
    console.warn('Google Maps API key not configured. Using approximate calculation.');
    const distance = getApproximateDistance(source, destination);
    return {
      distance: distance,
      duration: distance * 120, // Approx 2 mins per km
      durationText: `${Math.round(distance * 2)} mins`
    };
  }

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json`,
      {
        params: {
          origins: source,
          destinations: destination,
          key: apiKey,
          mode: 'driving'
        }
      }
    );

    if (response.data.status !== 'OK' || response.data.rows[0].elements[0].status !== 'OK') {
      throw new Error(response.data.error_message || 'Distance matrix calculation failed');
    }

    const element = response.data.rows[0].elements[0];
    return {
      distance: element.distance.value / 1000, // convert meters to km
      duration: element.duration.value, // in seconds
      durationText: element.duration.text
    };
  } catch (error) {
    console.error('Distance calculation error:', error.message);
    // Return approximate as fallback
    const distance = getApproximateDistance(source, destination);
    return {
      distance: distance,
      duration: distance * 120,
      durationText: `${Math.round(distance * 2)} mins`
    };
  }
};

/**
 * Calculate fare based on distance
 */
export const calculateFareFromDistance = (distance, baseFare = 50, perKmRate = 15) => {
  return Math.ceil(baseFare + distance * perKmRate);
};

/**
 * Simple approximate distance between two points (mock)
 * In a real scenario, this could use Haversine if coordinates were available
 */
export const getApproximateDistance = (source, destination) => {
  // Simple mock: length of strings as a seed for consistent "distance" between same names
  const seed = (source.length + destination.length) % 50;
  return 10 + seed * 5; // Distance between 10km and 260km
};
