/**
 * Example: How to use the Distance API in your components
 */

import React, { useState, useEffect } from 'react';
import { getDistanceAndFare, formatDistance, formatFare } from '../services/distanceService';

const DistanceCalculatorExample = ({ source, destination }) => {
  const [distanceData, setDistanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (source && destination) {
      fetchDistance();
    }
  }, [source, destination]);

  const fetchDistance = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDistanceAndFare(source, destination);
      setDistanceData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!source || !destination) {
    return <div>Please provide source and destination</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>Distance & Fare Calculator</h3>
      
      <p>
        <strong>From:</strong> {source}
      </p>
      <p>
        <strong>To:</strong> {destination}
      </p>

      {loading && <p>Calculating...</p>}
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {distanceData && (
        <div>
          <p>
            <strong>Distance:</strong> {formatDistance(distanceData.distance)}
          </p>
          <p>
            <strong>Duration:</strong> {distanceData.durationText}
          </p>
          <p>
            <strong>Estimated Fare:</strong> {formatFare(distanceData.estimatedFare)}
          </p>
        </div>
      )}

      <button onClick={fetchDistance} disabled={loading}>
        {loading ? 'Calculating...' : 'Recalculate'}
      </button>
    </div>
  );
};

export default DistanceCalculatorExample;
