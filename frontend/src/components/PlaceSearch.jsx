import React, { useRef, useEffect } from 'react';

export default function PlaceSearch({ onSelect, label = 'Place' }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) return;

    const input = inputRef.current;
    const ac = new window.google.maps.places.Autocomplete(input, {
      fields: ["formatted_address", "geometry", "name", "place_id"]
    });

    
    const handlePlaceChanged = () => {
      const place = ac.getPlace();
      if (!place.geometry) return;
      onSelect({
        place: place.formatted_address,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        place_id: place.place_id
      });
    };

    ac.addListener('place_changed', handlePlaceChanged);

    return () => {
      if (ac) window.google.maps.event.clearInstanceListeners(ac);
    };
  }, [onSelect]);

  return (
    <div>
      <label htmlFor="place-search-input">{label}</label>
      <input
        id="place-search-input"
        ref={inputRef}
        type="text"
        placeholder={`Search ${label}`}
        style={{ width: 300 }}
        autoComplete="off"
      />
    </div>
  );
}
