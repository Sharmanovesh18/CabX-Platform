import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-11/12 md:w-1/2 max-w-md">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Share Your Ride?
          </h3>
          <p className="text-gray-600 mb-6 text-center">
            Would you like to share this ride with co-passengers traveling the same route?
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setWantCoPassenger(false)}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-300 transition-colors"
            >
              No, Continue Alone
            </button>
            <button
              onClick={() => setWantCoPassenger(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
            >
              Yes, Find Co-Passengers
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-4 w-full text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel Booking
          </button>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-11/12 md:w-2/3 max-w-4xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Available Co-Passengers</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-light"
          >
            &times;
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading co-passengers...</div>
        ) : coPassengers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No co-passengers found for this route yet.</p>
            <p className="text-sm text-gray-500">You can still proceed with your booking.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
            {coPassengers.map((passenger) => (
              <div
                key={passenger._id}
                onClick={() => togglePassengerSelection(passenger._id)}
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  selectedPassengers.includes(passenger._id)
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {passenger.name?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg">{passenger.name || 'Passenger'}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>📞</span>
                          <span>{passenger.phone || passenger.contact || 'Not available'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600 font-semibold">📍 From:</span>
                        <span className="text-gray-700">{passenger.pickupLocation || passenger.source || ride.source}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-600 font-semibold">📍 To:</span>
                        <span className="text-gray-700">{passenger.dropLocation || passenger.destination || ride.destination}</span>
                      </div>
                    </div>
                  </div>
                  {selectedPassengers.includes(passenger._id) && (
                    <div className="ml-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 justify-end border-t pt-4">
          <button
            onClick={() => setWantCoPassenger(null)}
            className="px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
          >
            Back
          </button>
          <button
            onClick={handleProceed}
            className="px-6 py-2 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold"
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
