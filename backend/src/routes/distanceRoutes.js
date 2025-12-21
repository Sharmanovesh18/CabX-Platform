import express from 'express';
import {
  getDistanceAndDuration,
  calculateFareFromDistance,
  getApproximateDistance,
} from '../utils/distanceCalculator.js';

const router = express.Router();

/**
 * GET /api/distance/calculate
 * Query params:
 *   - source: Starting location (required)
 *   - destination: Ending location (required)
 *   - baseFare: Base fare (optional, default: 50)
 *   - perKmRate: Rate per km (optional, default: 15)
 * 
 * Returns:
 *   - distance: Distance in km
 *   - duration: Duration in seconds
 *   - durationText: Formatted duration
 *   - estimatedFare: Calculated fare
 */
router.get('/calculate', async (req, res) => {
  try {
    const { source, destination, baseFare = 50, perKmRate = 15 } = req.query;

    if (!source || !destination) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'source and destination are required',
      });
    }

    const distanceData = await getDistanceAndDuration(source, destination);
    const estimatedFare = calculateFareFromDistance(
      distanceData.distance,
      parseFloat(baseFare),
      parseFloat(perKmRate)
    );

    res.json({
      success: true,
      source,
      destination,
      distance: distanceData.distance,
      distanceUnit: 'km',
      duration: distanceData.duration,
      durationText: distanceData.durationText,
      estimatedFare,
      fareDetails: {
        baseFare: parseFloat(baseFare),
        perKmRate: parseFloat(perKmRate),
        distance: distanceData.distance,
      },
    });
  } catch (err) {
    console.error('Error calculating distance:', err);
    res.status(500).json({
      error: 'Distance calculation failed',
      message: err.message,
    });
  }
});

/**
 * POST /api/distance/bulk
 * Request body:
 *   - routes: Array of { source, destination } objects
 * 
 * Returns:
 *   - Array of distance data for each route
 */
router.post('/bulk', async (req, res) => {
  try {
    const { routes } = req.body;

    if (!routes || !Array.isArray(routes) || routes.length === 0) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'routes array is required',
      });
    }

    const results = await Promise.all(
      routes.map(async (route) => {
        const distanceData = await getDistanceAndDuration(
          route.source,
          route.destination
        );
        const estimatedFare = calculateFareFromDistance(distanceData.distance);

        return {
          source: route.source,
          destination: route.destination,
          distance: distanceData.distance,
          durationText: distanceData.durationText,
          estimatedFare,
        };
      })
    );

    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (err) {
    console.error('Error in bulk distance calculation:', err);
    res.status(500).json({
      error: 'Bulk calculation failed',
      message: err.message,
    });
  }
});

/**
 * GET /api/distance/simple
 * Simple endpoint that just returns distance
 * Query params: source, destination
 */
router.get('/simple', (req, res) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'source and destination are required',
      });
    }

    const distance = getApproximateDistance(source, destination);

    res.json({
      success: true,
      source,
      destination,
      distance,
      unit: 'km',
    });
  } catch (err) {
    console.error('Error in simple distance:', err);
    res.status(500).json({
      error: 'Distance fetch failed',
      message: err.message,
    });
  }
});

export default router;
