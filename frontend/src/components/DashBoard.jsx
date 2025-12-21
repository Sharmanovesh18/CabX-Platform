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
    <div className="ride-card ride-card-gradient">
      <div className="ride-top-row">
        <span className="ride-time-main">{ride.startTime || ride.time}</span>
        <div className="ride-duration">
          <span className="ride-line"></span>
          <span>{ride.duration || "45 min"}</span>
          <span className="ride-line"></span>
        </div>
        <span className="ride-time-main">{ride.endTime || "TBD"}</span>
      </div>

      <div className="ride-locations">
        <span>{ride.source}</span>
        <span>→</span>
        <span>{ride.destination}</span>
      </div>

      <div className="ride-info-row">
        <span>🚗</span>
        <span className="driver-avatar">
          {ride.driverImg ? (
            <img src={ride.driverImg} alt={typeof ride.driver === "object" ? ride.driver.name : ride.driver} />
          ) : (
            <span className="avatar-blank"></span>
          )}
        </span>
        <span className="driver-name">{typeof ride.driver === "object" ? ride.driver.name : ride.driver}</span>
        {(ride.rating || (ride.driver && ride.driver.rating)) && (
          <span className="driver-rating">★ {ride.rating || ride.driver.rating}</span>
        )}
      </div>

      <div className="ride-bottom-row">
        <span className="ride-fare">₹{ride.fare}</span>
        <div className="booking-options">
          <span className="booking-type">⚡ {ride.bookingType || "Instant"}</span>
          <button
            onClick={() => onBook(ride._id)}
            disabled={bookingLoading && bookingRideId === ride._id}
          >
            {bookingLoading && bookingRideId === ride._id ? "Booking..." : "Book"}
          </button>
          {ride.stops?.includes(ride.destination) && (
            <button onClick={() => onShare(ride._id)}>Agree</button>
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
          // Send complete ride data for demo rides that might not exist in DB yet
          source: selectedRideForBooking.source,
          destination: selectedRideForBooking.destination,
          date: selectedRideForBooking.date,
          time: selectedRideForBooking.time,
          fare: selectedRideForBooking.fare,
          driver: selectedRideForBooking.driver,
          vehicleType: selectedRideForBooking.vehicleType,
          remainingSeats: selectedRideForBooking.remainingSeats,
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
    <div id="dashboard-container">
      <div id="dashboard-content">
        <h1 className="page-title">Ride Booking / Sharing</h1>

        <div className="dashboard-form-controls">
          <input
            type="text"
            placeholder="Search starts location..."
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="inputText"
          />
          <span className="swap-icon" onClick={() => {
            setStart(destination);
            setDestination(start);
          }}>⇅</span>
          <input
            type="text"
            placeholder="Search destination..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="inputText"
          />
          <input
            type="date"
            placeholder="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={todayDate}
            required
            className="inputText"
          />
          <input
            type="time"
            placeholder="Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="inputText"
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {message && (
          <div className={`alert ${message.type === 'info' ? 'alert-info' : 'alert-error'}`}>
            {message.text}
          </div>
        )}

        <div className="history-button-container">
          <button className="history-btn" onClick={handleShowHistory}>Show History</button>
        </div>

        <div className="ride-details">
          <h2>Available Rides</h2>
          <div className="space-y-4">
            {loading ? (
              <div className="loading-text">Loading...</div>
            ) : rides.length === 0 ? (
              <div className="loading-text">No rides found.</div>
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
        <div className="modal">
          <div className="history-content">
            <button className="close-btn" onClick={() => setHistoryOpen(false)}>&times;</button>
            <h3>Booking History</h3>
            {history.length === 0 ? (
              <div className="loading-text">No previous bookings.</div>
            ) : (
              <div className="history-list">
                {history.map((ride, idx) => (
                  <div className="history-card" key={ride._id || idx}>
                    <div><b>From:</b> {ride.source}</div>
                    <div><b>To:</b> {ride.destination}</div>
                    <div><b>Price:</b> <span className="ride-fare">₹{ride.fare}</span></div>
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
        <div className="modal">
          <div className="share-content">
            <button className="close-btn" onClick={() => setShareOpen(false)}>&times;</button>
            <h3>Shared Ride</h3>
            <div className="share-layout">
              <div className="driver-side">
                <h4>Driver</h4>
                <p><span>👤</span> <span>{sharedRide.driver}</span></p>
                <p><span>📞</span> <span>{sharedRide.driverPhone}</span></p>
                <p><span>⭐</span> <span>{sharedRide.rating}</span></p>
              </div>
              <div className="passenger-side">
                <h4>Co-Passengers</h4>
                {sharedRide.passengers?.length === 0 ? (
                  <p className="loading-text">No co-passengers yet</p>
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
        <div className="modal">
          <div className="popup-content">
            <button className="close-btn" onClick={() => setBookingPopup(null)}>&times;</button>
            <h3>🎉 Ride Booked!</h3>
            <div className="popup-body">
              <div><b>From:</b> {bookingPopup.start}</div>
              <div><b>To:</b> {bookingPopup.destination}</div>
              <div><b>Fare:</b> <span className="ride-fare">₹{bookingPopup.fare}</span></div>
              <div><b>Driver:</b> {bookingPopup.driver?.name || bookingPopup.driver}</div>
              <div><b>Remaining seats:</b> {bookingPopup.remainingSeats}</div>
            </div>
            <div className="popup-actions">
              <button onClick={() => setBookingPopup(null)} className="history-btn">Close</button>
              <button onClick={() => {
                window.history.pushState({ booking: bookingPopup }, '', '/payment');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }} className="primary-btn">Proceed to Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashBoard;