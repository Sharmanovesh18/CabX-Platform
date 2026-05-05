import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Navigation, Star, Car, Info, IndianRupee } from 'lucide-react';
import { getDistanceAndFare, formatDistance } from '../services/distanceService';
import RouteMap from './RouteMap';
import './RideDetailsModal.css';

const RideDetailsModal = ({ ride, onClose, onBook }) => {
  const [distanceData, setDistanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRealTimeData = async () => {
      setLoading(true);
      try {
        const data = await getDistanceAndFare(ride.source, ride.destination);
        setDistanceData(data);
      } catch (err) {
        console.error('Error fetching distance:', err);
        setError('Could not calculate real-time distance');
      } finally {
        setLoading(false);
      }
    };

    fetchRealTimeData();
  }, [ride]);

  return (
    <div className="ride-details-modal-overlay" onClick={onClose}>
      <motion.div 
        className="ride-details-modal-content"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
      >
        <div className="ride-details-header">
          <button className="ride-details-close" onClick={onClose}><X size={18} /></button>
          <h2>Ride Details</h2>
          <p>Real-time information for your journey</p>
        </div>

        <div className="ride-details-body">
          <div className="ride-details-left">
            <div className="ride-details-section">
              <h3>Route</h3>
              <div className="route-info">
                <div className="route-visual">
                  <div className="route-dot"></div>
                  <div className="route-line"></div>
                  <div className="route-dot" style={{ background: '#ef4444' }}></div>
                </div>
                <div className="route-text">
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Pickup</p>
                    <p style={{ fontWeight: '600' }}>{ride.source}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Destination</p>
                    <p style={{ fontWeight: '600' }}>{ride.destination}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="ride-details-section">
              <h3>Real-time Stats</h3>
              <div className="real-time-stats">
                <div className="stat-card">
                  <span className="stat-icon"><Navigation size={20} color="#2563eb" /></span>
                  <span className="stat-value">
                    {loading ? '...' : distanceData ? formatDistance(distanceData.distance) : 'N/A'}
                  </span>
                  <span className="stat-label">Distance</span>
                </div>
                <div className="stat-card">
                  <span className="stat-icon"><Clock size={20} color="#059669" /></span>
                  <span className="stat-value">
                    {loading ? '...' : distanceData ? distanceData.durationText : 'N/A'}
                  </span>
                  <span className="stat-label">Est. Time</span>
                </div>
              </div>
              {error && <p style={{ fontSize: '0.7rem', color: '#ef4444', textAlign: 'center' }}>{error}</p>}
            </div>

            <div className="ride-details-section">
              <h3>Driver & Vehicle</h3>
              <div className="driver-profile">
                <img 
                  src={ride.driver?.img || "https://via.placeholder.com/50"} 
                  alt={ride.driver?.name || "Driver"} 
                />
                <div className="driver-info">
                  <h4>{ride.driver?.name || "Professional Driver"}</h4>
                  <span className="driver-rating">★ {ride.driver?.rating || "4.8"}</span>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Vehicle</p>
                  <p style={{ fontWeight: '600' }}><Car size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {ride.vehicleType || 'Sedan'}</p>
                </div>
              </div>
            </div>

            <div className="ride-details-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Estimated Fare</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2563eb' }}>₹{ride.fare}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Seats Left</p>
                  <p style={{ fontWeight: '700' }}>{ride.remainingSeats} Seats</p>
                </div>
              </div>
            </div>
          </div>

          <div className="ride-details-right">
            <h3>Route Visualization</h3>
            <RouteMap origin={ride.source} destination={ride.destination} height="450px" />
          </div>
        </div>

        <div className="ride-details-footer">
          <button className="cancel-btn" onClick={onClose}>Close</button>
          <button 
            className="book-now-btn" 
            onClick={() => {
              onBook(ride._id);
              onClose();
            }}
          >
            Confirm & Book
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RideDetailsModal;
