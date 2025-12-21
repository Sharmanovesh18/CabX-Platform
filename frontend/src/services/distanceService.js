/**
 * Frontend Distance Service
 * Handles all distance-related API calls
 */

const DISTANCE_API_BASE = "http://localhost:5000/api/distance";

/**
 * Get distance and fare between two locations
 * @param {string} source - Starting location
 * @param {string} destination - Ending location
 * @param {number} baseFare - Optional base fare (default: 50)
 * @param {number} perKmRate - Optional rate per km (default: 15)
 * @returns {Promise<Object>} Distance data with fare estimate
 */
export const getDistanceAndFare = async (
  source,
  destination,
  baseFare = 50,
  perKmRate = 15
) => {
  try {
    const params = new URLSearchParams({
      source,
      destination,
      baseFare,
      perKmRate,
    });

    const response = await fetch(`${DISTANCE_API_BASE}/calculate?${params}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch distance");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching distance and fare:", error);
    throw error;
  }
};

/**
 * Get simple distance between two locations
 * @param {string} source - Starting location
 * @param {string} destination - Ending location
 * @returns {Promise<number>} Distance in km
 */
export const getSimpleDistance = async (source, destination) => {
  try {
    const params = new URLSearchParams({ source, destination });
    const response = await fetch(`${DISTANCE_API_BASE}/simple?${params}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch distance");
    }

    const data = await response.json();
    return data.distance;
  } catch (error) {
    console.error("Error fetching simple distance:", error);
    throw error;
  }
};

/**
 * Get distance for multiple routes at once
 * @param {Array<Object>} routes - Array of {source, destination} objects
 * @returns {Promise<Array>} Array of distance data for each route
 */
export const getBulkDistances = async (routes) => {
  try {
    const response = await fetch(`${DISTANCE_API_BASE}/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ routes }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch bulk distances");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching bulk distances:", error);
    throw error;
  }
};

/**
 * Format distance for display
 * @param {number} distance - Distance in km
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

/**
 * Format fare for display
 * @param {number} fare - Fare amount
 * @returns {string} Formatted fare string
 */
export const formatFare = (fare) => {
  return `₹${Math.ceil(fare)}`;
};
