import React, { useRef, useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import PlaceSearch from './PlaceSearch';
import StartControl from './StartControl';
import axios from 'axios';
import { decodePolyline, smoothRoutePoints } from './Utils/routeUtils';


const containerStyle = { width: '100%', height: '80vh' };
const center = { lat: 22.5726, lng: 88.3639 }; // default
const LIBRARIES = ['places'];

export default function MapPage(){
  const browserKey = import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_BROWSER_KEY;
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: browserKey, libraries: LIBRARIES });

  const mapRef = useRef(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routePolyline, setRoutePolyline] = useState([]); // array of {lat,lng}
  const [currentPos, setCurrentPos] = useState(null);
  const [following, setFollowing] = useState(false);
  const followRef = useRef({ idx:0, animTimer:null });

  useEffect(() => {
    // start watching user position (for real-time tracking)
    if(navigator.geolocation){
      const id = navigator.geolocation.watchPosition(p => {
        setCurrentPos({ lat:p.coords.latitude, lng:p.coords.longitude, accuracy:p.coords.accuracy });
      }, err => console.warn('geo err', err), { enableHighAccuracy:true, maximumAge:1000 });
      return ()=> navigator.geolocation.clearWatch(id);
    }
  }, []);

  const onLoad = map => { mapRef.current = map; };

  const fetchRoute = async () => {
    if(!origin || !destination) return alert('choose origin & destination');
    const resp = await axios.post('http://localhost:5001/api/directions', {
      origin: origin.place || `${origin.lat},${origin.lng}`,
      destination: destination.place || `${destination.lat},${destination.lng}`,
      travelMode: 'DRIVING'
    });
    const routes = resp.data.routes;
    if(!routes || routes.length===0) return alert('No route found');
    // Use overview_polyline (encoded) for full display
    const encoded = routes[0].overview_polyline?.points;
    const decoded = decodePolyline(encoded); // returns [{lat,lng},...]
    const smoothed = smoothRoutePoints(decoded, 2); // reduce points if needed
    setRoutePolyline(smoothed);
    // fit map to bounds
    const bounds = new window.google.maps.LatLngBounds();
    smoothed.forEach(p => bounds.extend(p));
    mapRef.current.fitBounds(bounds);
    return routes[0]; // contains legs and steps (for instructions)
  };

  const startFollowing = () => {
    if(routePolyline.length===0) return alert('no route - fetch first');
    setFollowing(true);
    // simple simulation: move marker along polyline points
    let i = 0;
    const stepMs = 1000; // 1s per step — tune as needed
    function step(){
      if(i >= routePolyline.length){ setFollowing(false); return; }
      setCurrentPos(routePolyline[i]);
      i++;
      followRef.current.animTimer = setTimeout(step, stepMs);
    }
    step();
  };

  const stopFollowing = () => {
    setFollowing(false);
    clearTimeout(followRef.current.animTimer);
  };

  if(!isLoaded) return <div>Loading map...</div>;

  return (
    <div>
      <div style={{display:'flex', gap:8}}>
        <PlaceSearch onSelect={(p)=>setOrigin(p)} label="Origin" />
        <PlaceSearch onSelect={(p)=>setDestination(p)} label="Destination" />
        <button onClick={fetchRoute}>Get Route</button>
        <StartControl onStart={startFollowing} onStop={stopFollowing} running={following} disabled={routePolyline.length === 0}/>
      </div>

      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13} onLoad={onLoad}>
        { currentPos && <Marker position={currentPos} label="You" /> }
        { origin && origin.lat && <Marker position={origin} label="A" /> }
        { destination && destination.lat && <Marker position={destination} label="B" /> }
        { routePolyline.length>0 && <Polyline path={routePolyline} options={{ strokeWeight:4 }} /> }
      </GoogleMap>
    </div>
  );
}
