/**
 * Updated DashBoard Component with Real-time Place Search
 * 
 * This is a guide showing how to integrate PlaceSearchInput
 * Replace the input fields in your DashBoard.jsx with this approach
 */

import React, { useState, useEffect } from "react";
import axios from "axios";
import './DashBoard.css';
import { useNavigate } from 'react-router-dom';
import CoPassengerModal from './CoPassengerModal';
import PlaceSearchInput from './PlaceSearchInput';

// ... (keep all existing code for TimedRideCard and other components)

const DashBoard = () => {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [startPlaceData, setStartPlaceData] = useState(null);
  const [destinationPlaceData, setDestinationPlaceData] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  // ... (keep all other state variables)

  const todayDate = new Date().toISOString().split('T')[0];

  const handleSearch = async () => {
    if (!start || !destination) {
      alert("Please enter both location");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/rides/search", {
        params: {
          source: start,
          destination,
          date,
          time,
        },
      });

      if (res.data.results.length === 0) {
        if (date) {
          const fallback = await axios.get("http://localhost:5000/api/rides/search", {
            params: { source: start, destination }
          });
          if ((fallback.data.results || []).length > 0) {
            setRides(fallback.data.results);
          } else {
            setRides([]);
          }
        } else {
          setRides([]);
        }
      } else {
        setRides(res.data.results || []);
      }
    } catch (err) {
      console.error("Search error:", err);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="dashboard-container">
      <div id="dashboard-content">
        <h1 className="page-title">Find Your Ride</h1>

        {/* Updated Search Form with PlaceSearchInput */}
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
              setStartPlaceData(destinationPlaceData);
              setDestinationPlaceData(startPlaceData);
            }}
            type="button"
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

          <div className="date-time-inputs">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={todayDate}
              className="inputText"
              placeholder="Select Date"
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="inputText"
              placeholder="Select Time"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="primary-btn"
            style={{ marginTop: "20px" }}
          >
            {loading ? "Searching..." : "🔍 Search Rides"}
          </button>
        </div>

        {/* Rest of the component remains the same */}
        {rides.length > 0 && (
          <div className="rides-section">
            <h2>Available Rides ({rides.length})</h2>
            <div className="rides-container">
              {rides.map((ride) => (
                <div key={ride._id} className="ride-card ride-card-gradient">
                  {/* Render ride details */}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
