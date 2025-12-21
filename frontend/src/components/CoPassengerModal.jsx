import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CoPassengerModal.css';

const CoPassengerModal = ({ ride, onClose, onProceed }) => {
  const [wantCoPassenger, setWantCoPassenger] = useState(null);
  const [coPassengers, setCoPassengers] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wantCoPassenger === true) {
      fetchCoPassengers();
    }
  }, [wantCoPassenger]);

  const fetchCoPassengers = async () => {
    setLoading(true);
    try {
      // Fetch passengers who have booked the same route
      const res = await axios.get(`http://localhost:5000/api/rides/${ride._id}/co-passengers`);
      setCoPassengers(res.data.passengers || []);
    } catch (err) {
      console.error('Error fetching co-passengers:', err);
      setCoPassengers([]);
    } finally {
      setLoading(false);
    }
  };

  const togglePassengerSelection = (passengerId) => {
    setSelectedPassengers(prev => {
      if (prev.includes(passengerId)) {
        return prev.filter(id => id !== passengerId);
      } else {
        return [...prev, passengerId];
      }
    });
  };

  const handleProceed = () => {
    onProceed({
      shareRide: wantCoPassenger,
      selectedPassengers: wantCoPassenger ? selectedPassengers : []
    });
  };

  if (wantCoPassenger === null) {
    return (
      <div className="copassenger-modal-overlay">
        <div className="copassenger-modal-content">
          <h3 className="copassenger-modal-title">
            Share Your Ride?
          </h3>
          <p className="copassenger-modal-description">
            Would you like to share this ride with co-passengers traveling the same route?
          </p>
          <div className="copassenger-modal-buttons">
            <button
              onClick={() => setWantCoPassenger(false)}
              className="copassenger-btn copassenger-btn-secondary"
            >
              No, Continue Alone
            </button>
            <button
              onClick={() => setWantCoPassenger(true)}
              className="copassenger-btn copassenger-btn-primary"
            >
              Yes, Find Co-Passengers
            </button>
          </div>
          <div
            onClick={onClose}
            className="copassenger-cancel-link"
          >
            Cancel Booking
          </div>
        </div>
      </div>
    );
  }

  if (wantCoPassenger === false) {
    // Directly proceed to payment
    handleProceed();
    return null;
  }

  return (
    <div className="copassenger-modal-overlay">
      <div className="copassenger-modal-content copassenger-modal-content-wide">
        <div className="copassenger-modal-header">
          <h3 className="copassenger-modal-title">Available Co-Passengers</h3>
          <button
            onClick={onClose}
            className="copassenger-modal-close"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="copassenger-loading">Loading co-passengers...</div>
        ) : coPassengers.length === 0 ? (
          <div className="copassenger-empty">
            <p>No co-passengers found for this route yet.</p>
            <p>You can still proceed with your booking.</p>
          </div>
        ) : (
          <div className="copassenger-list">
            {coPassengers.map((passenger) => (
              <div
                key={passenger._id}
                onClick={() => togglePassengerSelection(passenger._id)}
                className={`copassenger-item ${
                  selectedPassengers.includes(passenger._id) ? 'selected' : ''
                }`}
              >
                <div className="copassenger-item-header">
                  <div className="copassenger-item-main">
                    <div className="copassenger-item-user">
                      <div className="copassenger-avatar">
                        {passenger.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div className="copassenger-user-info">
                        <h4>{passenger.name || 'Passenger'}</h4>
                        <div className="copassenger-contact">
                          <span>📞</span>
                          <span>{passenger.phone || passenger.contact || 'Not available'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="copassenger-locations">
                      <div className="copassenger-location">
                        <span className="copassenger-location-label from">📍 From:</span>
                        <span className="copassenger-location-text">{passenger.pickupLocation || passenger.source || ride.source}</span>
                      </div>
                      <div className="copassenger-location">
                        <span className="copassenger-location-label to">📍 To:</span>
                        <span className="copassenger-location-text">{passenger.dropLocation || passenger.destination || ride.destination}</span>
                      </div>
                    </div>
                  </div>
                  {selectedPassengers.includes(passenger._id) && (
                    <div className="copassenger-checkmark">
                      ✓
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="copassenger-footer">
          <button
            onClick={() => setWantCoPassenger(null)}
            className="copassenger-btn copassenger-btn-secondary"
          >
            Back
          </button>
          <button
            onClick={handleProceed}
            className="copassenger-btn copassenger-btn-success"
          >
            {selectedPassengers.length > 0
              ? `Proceed with ${selectedPassengers.length} Co-Passenger${selectedPassengers.length > 1 ? 's' : ''}`
              : 'Proceed to Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoPassengerModal;
