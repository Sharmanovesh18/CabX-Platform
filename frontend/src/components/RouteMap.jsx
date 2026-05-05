import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '12px',
  marginTop: '15px'
};

const center = {
  lat: 20.5937,
  lng: 78.9629 // Center of India
};

const LIBRARIES = ['places'];

const RouteMap = ({ origin, destination, height = '300px' }) => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const containerStyle = {
    width: '100%',
    height: height,
    borderRadius: '12px',
    marginTop: '15px'
  };

  const apiKey = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_BROWSER_KEY || "";

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES
  });

  const directionsCallback = useCallback((res) => {
    if (res !== null) {
      if (res.status === 'OK') {
        setResponse(res);
      } else {
        console.error('Directions request failed:', res.status);
        setError('Could not find a route for the specified locations.');
      }
    }
  }, []);

  if (!isLoaded) return <div className="map-loading">Loading Map...</div>;
  if (!apiKey) return <div className="map-error">Google Maps API Key missing. Please set VITE_REACT_APP_GOOGLE_MAPS_BROWSER_KEY in your .env file.</div>;

  return (
    <div className="route-map-container">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
      >
        {origin && destination && (
          <DirectionsService
            options={{
              destination: destination,
              origin: origin,
              travelMode: 'DRIVING',
            }}
            callback={directionsCallback}
          />
        )}

        {response !== null && (
          <DirectionsRenderer
            options={{
              directions: response,
            }}
          />
        )}
      </GoogleMap>
      {error && <p className="map-error-text">{error}</p>}
    </div>
  );
};

export default React.memo(RouteMap);
