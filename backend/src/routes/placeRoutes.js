import express from 'express';

const router = express.Router();

/**
 * GET /api/places/search
 * Query params:
 *   - q: Search query (required)
 *   - limit: Max results (optional, default: 10)
 * 
 * Returns:
 *   - Array of place suggestions
 */
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Search query must be at least 2 characters'
      });
    }

    // Using OpenStreetMap Nominatim API
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=${limit}&addressdetails=1&countrycodes=in`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CabBookingApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Place search API failed');
    }

    const data = await response.json();

    const results = data.map((place) => ({
      id: place.place_id,
      name: place.name,
      displayName: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      type: place.type,
      address: {
        road: place.address?.road,
        city: place.address?.city || place.address?.town || place.address?.village,
        state: place.address?.state,
        country: place.address?.country,
        postcode: place.address?.postcode
      }
    }));

    res.json({
      success: true,
      query: q,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error in place search:', error);
    res.status(500).json({
      error: 'Place search failed',
      message: error.message
    });
  }
});

/**
 * GET /api/places/popular
 * Returns popular cities in India
 */
router.get('/popular', (req, res) => {
  const popularCities = [
    {
      name: 'Delhi',
      state: 'Delhi',
      latitude: 28.7041,
      longitude: 77.1025
    },
    {
      name: 'Mumbai',
      state: 'Maharashtra',
      latitude: 19.0760,
      longitude: 72.8777
    },
    {
      name: 'Bangalore',
      state: 'Karnataka',
      latitude: 12.9716,
      longitude: 77.5946
    },
    {
      name: 'Hyderabad',
      state: 'Telangana',
      latitude: 17.3850,
      longitude: 78.4867
    },
    {
      name: 'Chennai',
      state: 'Tamil Nadu',
      latitude: 13.0827,
      longitude: 80.2707
    },
    {
      name: 'Kolkata',
      state: 'West Bengal',
      latitude: 22.5726,
      longitude: 88.3639
    },
    {
      name: 'Pune',
      state: 'Maharashtra',
      latitude: 18.5204,
      longitude: 73.8567
    },
    {
      name: 'Ahmedabad',
      state: 'Gujarat',
      latitude: 23.0225,
      longitude: 72.5714
    },
    {
      name: 'Jaipur',
      state: 'Rajasthan',
      latitude: 26.9124,
      longitude: 75.7873
    },
    {
      name: 'Chandigarh',
      state: 'Chandigarh',
      latitude: 30.7333,
      longitude: 76.7794
    },
    {
      name: 'Gurgaon',
      state: 'Haryana',
      latitude: 28.4595,
      longitude: 77.0266
    },
    {
      name: 'Noida',
      state: 'Uttar Pradesh',
      latitude: 28.5355,
      longitude: 77.3910
    },
    {
      name: 'Indore',
      state: 'Madhya Pradesh',
      latitude: 22.7196,
      longitude: 75.8577
    },
    {
      name: 'Kochi',
      state: 'Kerala',
      latitude: 9.9312,
      longitude: 76.2673
    },
    {
      name: 'Surat',
      state: 'Gujarat',
      latitude: 21.1458,
      longitude: 72.1940
    }
  ];

  res.json({
    success: true,
    count: popularCities.length,
    cities: popularCities
  });
});

/**
 * GET /api/places/autocomplete
 * Autocomplete suggestions as user types
 * Query params:
 *   - input: Partial location name (required)
 *   - limit: Max results (optional, default: 5)
 */
router.get('/autocomplete', async (req, res) => {
  try {
    const { input, limit = 5 } = req.query;

    if (!input || input.trim().length < 1) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Input is required'
      });
    }

    // Use Nominatim API with custom parameters for faster autocomplete
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=${limit}&addressdetails=1&countrycodes=in&type=city`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CabBookingApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error('Autocomplete API failed');
    }

    const data = await response.json();

    const results = data.map((place) => ({
      id: place.place_id,
      name: place.name,
      displayName: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      type: place.type,
    }));

    res.json({
      success: true,
      input,
      count: results.length,
      suggestions: results
    });
  } catch (error) {
    console.error('Error in autocomplete:', error);
    res.status(500).json({
      error: 'Autocomplete failed',
      message: error.message
    });
  }
});

/**
 * POST /api/places/batch-search
 * Search multiple locations at once
 * Request body:
 *   - queries: Array of search strings
 */
router.post('/batch-search', async (req, res) => {
  try {
    const { queries } = req.body;

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'queries array is required'
      });
    }

    const results = await Promise.all(
      queries.map(async (query) => {
        try {
          const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1&countrycodes=in`;
          const response = await fetch(url, {
            headers: { 'User-Agent': 'CabBookingApp/1.0' }
          });

          if (!response.ok) throw new Error('API failed');

          const data = await response.json();
          if (data.length > 0) {
            const place = data[0];
            return {
              query,
              found: true,
              place: {
                name: place.name,
                latitude: parseFloat(place.lat),
                longitude: parseFloat(place.lon),
                address: place.display_name
              }
            };
          }
          return { query, found: false };
        } catch (error) {
          return { query, found: false, error: error.message };
        }
      })
    );

    res.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error in batch search:', error);
    res.status(500).json({
      error: 'Batch search failed',
      message: error.message
    });
  }
});

export default router;
