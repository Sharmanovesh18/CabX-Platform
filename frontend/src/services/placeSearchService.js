/**
 * Place Search Service
 * Provides autocomplete and place search functionality
 * Supports multiple APIs: OpenStreetMap (free), Google Places (paid)
 */

// Using OpenStreetMap Nominatim (FREE - No API key needed)
const NOMINATIM_API = "https://nominatim.openstreetmap.org/search";

// Google Places API (requires API key)
const GOOGLE_PLACES_API = "https://maps.googleapis.com/maps/api/place/autocomplete/json";

/**
 * Search places using OpenStreetMap Nominatim (FREE)
 * @param {string} query - Search query (city, address, landmark, etc.)
 * @returns {Promise<Array>} Array of place suggestions
 */
export const searchPlacesNominatim = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `${NOMINATIM_API}?q=${encodeURIComponent(query)}&format=json&limit=10&addressdetails=1`,
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": "CabBookingApp/1.0"
        }
      }
    );

    if (!response.ok) {
      throw new Error("Place search failed");
    }

    const data = await response.json();
    
    return data.map((place) => ({
      id: place.place_id,
      name: place.name,
      displayName: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      type: place.type,
      addressType: place.addresstype,
      address: {
        road: place.address?.road,
        city: place.address?.city || place.address?.town || place.address?.village,
        state: place.address?.state,
        country: place.address?.country,
        postcode: place.address?.postcode
      }
    }));
  } catch (error) {
    console.error("Error searching places (Nominatim):", error);
    return [];
  }
};

/**
 * Search places using Google Places API (Requires API Key)
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of place suggestions
 */
export const searchPlacesGoogle = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("Google Maps API key not configured, use searchPlacesNominatim instead");
      return [];
    }

    const response = await fetch(
      `${GOOGLE_PLACES_API}?input=${encodeURIComponent(query)}&key=${apiKey}&components=country:in`,
      {
        headers: {
          "Accept": "application/json"
        }
      }
    );

    if (!response.ok) {
      throw new Error("Google Places search failed");
    }

    const data = await response.json();

    if (data.status !== "OK") {
      console.warn("Google Places API status:", data.status);
      return [];
    }

    return data.predictions.map((place) => ({
      id: place.place_id,
      name: place.main_text,
      displayName: place.description,
      address: place.description,
      source: "google"
    }));
  } catch (error) {
    console.error("Error searching places (Google):", error);
    return [];
  }
};

/**
 * Default search function - uses Nominatim (FREE)
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of place suggestions
 */
export const searchPlaces = async (query) => {
  return searchPlacesNominatim(query);
};

/**
 * Get place details including coordinates
 * @param {string} placeName - Name of the place
 * @returns {Promise<Object>} Place details with coordinates
 */
export const getPlaceDetails = async (placeName) => {
  try {
    const results = await searchPlaces(placeName);
    if (results.length > 0) {
      return results[0];
    }
    return null;
  } catch (error) {
    console.error("Error getting place details:", error);
    return null;
  }
};

/**
 * Search with debouncing (to prevent too many API calls)
 * @param {string} query - Search query
 * @param {number} delay - Debounce delay in ms
 * @returns {Promise<Array>} Place suggestions
 */
let debounceTimer;
export const searchPlacesDebounced = async (query, delay = 500) => {
  return new Promise((resolve) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const results = await searchPlaces(query);
      resolve(results);
    }, delay);
  });
};

/**
 * Popular cities in India (for quick suggestions)
 */
export const popularCities = [
  { name: "Delhi", state: "Delhi" },
  { name: "Mumbai", state: "Maharashtra" },
  { name: "Bangalore", state: "Karnataka" },
  { name: "Hyderabad", state: "Telangana" },
  { name: "Chennai", state: "Tamil Nadu" },
  { name: "Kolkata", state: "West Bengal" },
  { name: "Pune", state: "Maharashtra" },
  { name: "Ahmedabad", state: "Gujarat" },
  { name: "Jaipur", state: "Rajasthan" },
  { name: "Lucknow", state: "Uttar Pradesh" },
  { name: "Chandigarh", state: "Chandigarh" },
  { name: "Gurgaon", state: "Haryana" },
  { name: "Noida", state: "Uttar Pradesh" },
  { name: "Indore", state: "Madhya Pradesh" },
  { name: "Kochi", state: "Kerala" }
];

/**
 * Format place name for display
 * @param {Object} place - Place object
 * @returns {string} Formatted place name
 */
export const formatPlaceName = (place) => {
  if (typeof place === "string") return place;
  if (place.name) return place.name;
  if (place.displayName) return place.displayName;
  return "Unknown";
};
