import React, { useState, useEffect } from "react";
import axios from "axios";
import './DashBoard.css';
import { useNavigate } from 'react-router-dom';
import CoPassengerModal from './CoPassengerModal';
// This is a single-file React app, so all components and logic are here.
// No separate files are needed for this project.

const TimedRideCard = ({ ride, onBook, onShare, bookingRideId, bookingLoading }) => {
  const [visible, setVisible] = useState(true);

  // Set a timer to hide the ride card after 20 seconds.
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 20000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="ride-card-gradient p-4 rounded-xl shadow-md transition-transform transform hover:scale-105 w-full">
      <div className="flex justify-between items-center text-gray-700 font-semibold mb-2">
        <span>{ride.startTime || ride.time}</span>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span className="h-px w-4 bg-gray-400"></span>
          <span>{ride.duration || "45 min"}</span>
          <span className="h-px w-4 bg-gray-400"></span>
        </div>
        <span>{ride.endTime || "TBD"}</span>
      </div>
      <div className="text-center font-bold text-gray-800">
        <span className="block text-xl">{ride.source}</span>
        <span className="block text-sm text-gray-500 mt-1">to</span>
        <span className="block text-xl">{ride.destination}</span>
      </div>
      <div className="flex items-center space-x-2 mt-4 text-sm text-gray-600">
        <span className="text-xl">🚗</span>
        <span className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
          {ride.driverImg ? (
             <img src={ride.driverImg} alt={typeof ride.driver === "object" ? ride.driver.name : ride.driver} className="w-full h-full object-cover" />
          ) : (
            <span className="w-full h-full bg-gray-200 block"></span>
          )}
        </span>
        <span className="font-semibold text-gray-900">{typeof ride.driver === "object" ? ride.driver.name : ride.driver}</span>
        {(ride.rating || (ride.driver && ride.driver.rating)) && (
          <span className="text-yellow-500">★ {ride.rating || ride.driver.rating}</span>
        )}
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <span className="text-2xl font-bold text-green-600">₹{ride.fare}</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
            ⚡ {ride.bookingType || "Instant"}
          </span>
          <button
            onClick={() => onBook(ride._id)}
            disabled={bookingLoading && bookingRideId === ride._id}
            className="bg-green-600 text-white px-4 py-2 rounded-full font-bold transition-colors hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {bookingLoading && bookingRideId === ride._id ? "Booking..." : "Book"}
          </button>
          {ride.stops?.includes(ride.destination) && (
            <button onClick={() => onShare(ride._id)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-bold transition-colors hover:bg-gray-300">Agree</button>
          )}
        </div>
      </div>
    </div>
  );
};

const DashBoard = () => {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharedRide, setSharedRide] = useState(null);
  const [bookingPopup, setBookingPopup] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingRideId, setBookingRideId] = useState(null);
  const [message, setMessage] = useState(null);
  const [coPassengerModalOpen, setCoPassengerModalOpen] = useState(false);
  const [selectedRideForBooking, setSelectedRideForBooking] = useState(null);

  const todayDate = new Date().toISOString().split('T')[0];

  // Demo route suggestions (predefined popular routes)
  const demoRoutes = [
    { source: 'Mumbai', destination: 'Pune' },
    { source: 'Mumbai', destination: 'Nashik' },
    { source: 'Delhi', destination: 'Gurgaon' },
    { source: 'Rajpura', destination: 'Chandigarh' },
  ];

  const handleSearch = async () => {
    setMessage(null);
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
        // If no matches for the requested date, try a relaxed search without date
        if (date) {
          const fallback = await axios.get("http://localhost:5000/api/rides/search", {
            params: { source: start, destination }
          });
          if ((fallback.data.results || []).length > 0) {
            setRides(fallback.data.results);
            setMessage({ type: 'info', text: 'Showing demo rides (date relaxed) for this route.' });
          } else {
            setRides([]);
            setMessage({ type: 'info', text: res.data.message || 'No rides found.' });
          }
        } else {
          setRides([]);
          setMessage({ type: 'info', text: res.data.message || 'No rides found.' });
        }
      } else {
        setRides(res.data.results || []);
      }
    } catch (err) {
      console.error("Axios error:", err);
      setRides([]);
      setMessage({ type: 'error', text: err.response?.data?.error || "Error searching for rides. Please try again later." });
    }
    setLoading(false);
  };

  const handleBook = async (rideIdParam) => {
    // First, show co-passenger selection modal
    const ride = rides.find(r => r._id === rideIdParam);
    if (ride) {
      setSelectedRideForBooking(ride);
      setCoPassengerModalOpen(true);
    }
  };

  const handleCoPassengerProceed = async (coPassengerData) => {
    // Close the modal and proceed with booking
    setCoPassengerModalOpen(false);
    const rideIdParam = selectedRideForBooking?._id;
    
    setBookingLoading(true);

    // support both _id and id, and ensure rideId passed correctly
    const rideId = (rideIdParam !== undefined && rideIdParam !== null) ? rideIdParam : null;
    setBookingRideId(rideId);

  // derive logged-in user's token from localStorage (AuthModal stores 'currentUser')
  const stored = JSON.parse(localStorage.getItem('currentUser')) || {};
  const token = stored?.token;

  try {
    const rideBookingResponse = await fetch("http://localhost:5000/api/rides/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ✅ Always attach Authorization header if token exists
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // ✅ include credentials if backend uses cookies/sessions
      credentials: "include",
      body: JSON.stringify({ 
        rideId,
        shareRide: coPassengerData.shareRide,
        coPassengers: coPassengerData.selectedPassengers
      })
    });

    if (!rideBookingResponse.ok) {
      // Try to parse JSON error
      try {
        const errJson = await rideBookingResponse.json();
        // If unauthorized, clear stale auth and prompt re-login
        if (rideBookingResponse.status === 401) {
          localStorage.removeItem('currentUser');
          window.dispatchEvent(new Event('auth-changed'));
          const userMsg = errJson?.message || 'Authentication required. Please sign in again.';
          setMessage({ type: 'error', text: `Booking failed: ${userMsg}` });
          return;
        }
        setMessage({ type: 'error', text: `Booking failed: ${JSON.stringify(errJson)}` });
      } catch (e) {
        const errText = await rideBookingResponse.text();
        setMessage({ type: 'error', text: `Booking failed: ${errText}` });
      }
      return;
    }

    const rideBookingData = await rideBookingResponse.json();

    setBookingPopup({
      start: rideBookingData.ride.source,
      destination: rideBookingData.ride.destination,
      fare: rideBookingData.ride.fare,
      driver: rideBookingData.ride.driver,
      remainingSeats: rideBookingData.ride.remainingSeats,
    });

    // Refresh the search results to show updated availability
    handleSearch();

  } catch (err) {
    console.error("Error booking:", err);
    setMessage({ type: 'error', text: `Booking failed: ${err.message}` });
  } finally {
    setBookingLoading(false);
    setBookingRideId(null);
  }
};

  const bookingHistory = async () => {
    const userId = "66d30d3ad4b0c9241c9d4a11";
    try {
      const res = await axios.get(`http://localhost:5000/api/bookings/history/${userId}`);
      setHistory(res.data);
    } catch (err) {
      console.error("Error fetching history:", err);
      setMessage({ type: 'error', text: "Failed to fetch booking history." });
    }
  };

  const handleShowHistory = () => {
    bookingHistory();
    setHistoryOpen(true);
  };

  const handleShare = async (bookingId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/bookings/${bookingId}/share`,
        { userId: "66d30d3ad4b0c9241c9d4a11" }
      );
      setSharedRide(res.data.data);
      setShareOpen(true);
    } catch (err) {
      console.error("Share ride failed:", err.response?.data || err.message);
      setMessage({ type: 'error', text: "Failed to share ride. " + (err.response?.data || err.message) });
    }
  };


  return (
    <div className="p-4 md:p-8 font-inter w-full" id="dashboard-container">
      <div className="w-full align-middle"  id="dashboard-content">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-8">
          Ride Booking / Sharing
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-4 bg-white p-6 rounded-2xl shadow-lg mb-8">
          <input
            type="text"
            placeholder="Search starts location..."
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="inputText flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <span className="text-3xl text-gray-500 cursor-pointer transition-transform hover:rotate-180" onClick={() => {
            setStart(destination);
            setDestination(start);
          }}>⇅</span>
          <input
            type="text"
            placeholder="Search destination..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="inputText flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            placeholder="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={todayDate}
            required
            className="inputText flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="time"
            placeholder="Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="inputText flex-1 min-w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleSearch} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-md transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Search
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-lg text-center font-semibold mb-6 ${message.type === 'info' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        <div className="text-center mb-6">
          <button className="bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full shadow-md transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400" onClick={handleShowHistory}>
            Show History
          </button>
        </div>

        <div className="ride-details">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6">
            Available Rides
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-500 text-lg">Loading...</div>
            ) : rides.length === 0 ? (
              <div className="text-center text-gray-500 text-lg">No rides found.</div>
            ) : (
              rides.map((ride) => (
                <TimedRideCard
                  key={ride._id || ride.driver?.name + ride.source + ride.destination}
                  ride={ride}
                  onBook={handleBook}
                  onShare={handleShare}
                  bookingRideId={bookingRideId}
                  bookingLoading={bookingLoading}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {historyOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-11/12 md:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Booking History</h3>
              <button className="text-gray-500 hover:text-gray-700 text-3xl font-light" onClick={() => setHistoryOpen(false)}>
                &times;
              </button>
            </div>
            {history.length === 0 ? (
              <div className="text-gray-500">No previous bookings.</div>
            ) : (
              <div className="space-y-4">
                {history.map((ride, idx) => (
                  <div className="border-b border-gray-200 pb-2" key={ride._id || idx}>
                    <div><b>From:</b> {ride.source}</div>
                    <div><b>To:</b> {ride.destination}</div>
                    <div><b>Price:</b> <span className="text-green-600 font-semibold">₹{ride.fare}</span></div>
                    <div><b>Driver:</b> {typeof ride.driver === "object" ? ride.driver.name : ride.driver}</div>
                    <div><b>Date:</b> {ride.bookingDate}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {shareOpen && sharedRide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-11/12 md:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Shared Ride</h3>
              <button className="text-gray-500 hover:text-gray-700 text-3xl font-light" onClick={() => setShareOpen(false)}>
                &times;
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2 text-gray-700">Driver</h4>
                <p className="flex items-center space-x-2 text-gray-600"><span>👤</span><span>{sharedRide.driver}</span></p>
                <p className="flex items-center space-x-2 text-gray-600"><span>📞</span><span>{sharedRide.driverPhone}</span></p>
                <p className="flex items-center space-x-2 text-gray-600"><span>⭐</span><span>{sharedRide.rating}</span></p>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2 text-gray-700">Co-Passengers</h4>
                {sharedRide.passengers?.length === 0 ? (
                  <p className="italic text-gray-500">No co-passengers yet</p>
                ) : (
                  sharedRide.passengers.map((p, idx) => (
                    <p key={p._id || p.name || idx}>👤 Passenger {idx + 1}</p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {coPassengerModalOpen && selectedRideForBooking && (
        <CoPassengerModal
          ride={selectedRideForBooking}
          onClose={() => {
            setCoPassengerModalOpen(false);
            setSelectedRideForBooking(null);
          }}
          onProceed={handleCoPassengerProceed}
        />
      )}

      {bookingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-11/12 md:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-green-600">🎉 Ride Booked!</h3>
              <button className="text-gray-500 hover:text-gray-700 text-3xl font-light" onClick={() => setBookingPopup(null)}>
                &times;
              </button>
            </div>
            <div className="space-y-2 text-gray-700">
              <div><b>From:</b> {bookingPopup.start}</div>
              <div><b>To:</b> {bookingPopup.destination}</div>
              <div><b>Fare:</b> <span className="text-green-600 font-semibold">₹{bookingPopup.fare}</span></div>
              <div><b>Driver:</b> {bookingPopup.driver?.name || bookingPopup.driver}</div>
              <div><b>Remaining seats:</b> {bookingPopup.remainingSeats}</div>
            </div>
            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={() => setBookingPopup(null)} className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300">Close</button>
              <button onClick={() => {
                // Navigate to payment page and pass booking details
                // using location state so the payment page can create an order
                window.history.pushState({ booking: bookingPopup }, '', '/payment');
                // navigate via location change so React Router loads the route
                window.dispatchEvent(new PopStateEvent('popstate'));
              }} className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700">Proceed to Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashBoard;