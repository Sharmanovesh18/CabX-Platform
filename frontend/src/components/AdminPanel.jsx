import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Settings, Car, MapPin, Calendar, Clock, DollarSign, ShieldCheck, Trash2, Edit } from 'lucide-react';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('drivers');
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form State for new driver/ride
  const [newRide, setNewRide] = useState({
    source: '',
    destination: '',
    date: '',
    time: '',
    fare: '',
    driverName: '',
    vehicleType: 'Sedan',
    seats: 4
  });

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/rides/search?source=&destination=');
      if (res.data && res.data.results) {
        setRides(res.data.results);
      }
    } catch (err) {
      console.error('Failed to fetch rides:', err);
    }
  };

  const handleInputChange = (e) => {
    setNewRide({ ...newRide, [e.target.name]: e.target.value });
  };

  const handleAddDriver = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const rideData = {
        source: newRide.source,
        destination: newRide.destination,
        date: newRide.date,
        time: newRide.time,
        fare: parseInt(newRide.fare),
        driver: {
          name: newRide.driverName,
          rating: 5.0,
          img: "https://via.placeholder.com/150"
        },
        vehicleType: newRide.vehicleType,
        remainingSeats: parseInt(newRide.seats)
      };

      const res = await axios.post('http://localhost:5001/api/rides/create', rideData);
      
      if (res.status === 201 || res.status === 200) {
        setMessage({ type: 'success', text: 'Driver and Ride added successfully!' });
        setNewRide({
          source: '', destination: '', date: '', time: '', fare: '',
          driverName: '', vehicleType: 'Sedan', seats: 4
        });
        fetchRides();
      }
    } catch (err) {
      console.error('Failed to add driver:', err);
      setMessage({ type: 'error', text: 'Failed to add driver. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel container">
      <header className="admin-header">
        <div className="admin-title">
          <ShieldCheck size={32} />
          <h1>Admin Management</h1>
        </div>
        <p className="admin-subtitle">Manage your platform's drivers, rides, and global settings.</p>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <button 
            className={`admin-tab ${activeTab === 'drivers' ? 'active' : ''}`}
            onClick={() => setActiveTab('drivers')}
          >
            <UserPlus size={20} /> Add Driver / Ride
          </button>
          <button 
            className={`admin-tab ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            <Car size={20} /> Manage Rides
          </button>
          <button 
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} /> Global Settings
          </button>
        </aside>

        <main className="admin-content">
          <AnimatePresence mode="wait">
            {activeTab === 'drivers' && (
              <motion.div 
                key="drivers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="admin-card"
              >
                <div className="card-header">
                  <h2>Register New Driver & Ride</h2>
                  <p>Fill out the details to add a new driver and their scheduled ride to the search results.</p>
                </div>

                <form className="admin-form" onSubmit={handleAddDriver}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label><UserPlus size={16} /> Driver Name</label>
                      <input name="driverName" value={newRide.driverName} onChange={handleInputChange} placeholder="e.g. Rahul Sharma" required />
                    </div>
                    <div className="form-group">
                      <label><Car size={16} /> Vehicle Type</label>
                      <select name="vehicleType" value={newRide.vehicleType} onChange={handleInputChange}>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Hatchback">Hatchback</option>
                        <option value="Luxury">Luxury</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label><MapPin size={16} /> Source City</label>
                      <input name="source" value={newRide.source} onChange={handleInputChange} placeholder="e.g. Delhi" required />
                    </div>
                    <div className="form-group">
                      <label><MapPin size={16} /> Destination City</label>
                      <input name="destination" value={newRide.destination} onChange={handleInputChange} placeholder="e.g. Jaipur" required />
                    </div>
                    <div className="form-group">
                      <label><Calendar size={16} /> Date</label>
                      <input type="date" name="date" value={newRide.date} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label><Clock size={16} /> Time</label>
                      <input type="time" name="time" value={newRide.time} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label><DollarSign size={16} /> Fare (₹)</label>
                      <input type="number" name="fare" value={newRide.fare} onChange={handleInputChange} placeholder="500" required />
                    </div>
                    <div className="form-group">
                      <label><UserPlus size={16} /> Available Seats</label>
                      <input type="number" name="seats" value={newRide.seats} onChange={handleInputChange} min="1" max="7" required />
                    </div>
                  </div>

                  {message.text && <div className={`admin-msg ${message.type}`}>{message.text}</div>}

                  <button type="submit" className="admin-submit-btn" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Driver & Schedule Ride'}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'manage' && (
              <motion.div 
                key="manage"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="admin-card"
              >
                <div className="card-header">
                  <h2>Current Scheduled Rides</h2>
                  <p>View and manage all active rides on the platform.</p>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Driver</th>
                        <th>Route</th>
                        <th>Date/Time</th>
                        <th>Fare</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rides.map((ride) => (
                        <tr key={ride._id}>
                          <td>
                            <div className="table-user">
                              <img src={ride.driver.img} alt={ride.driver.name} />
                              <div>
                                <strong>{ride.driver.name}</strong>
                                <span>{ride.vehicleType}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="table-route">
                              {ride.source} → {ride.destination}
                            </div>
                          </td>
                          <td>{ride.date} | {ride.time}</td>
                          <td>₹{ride.fare}</td>
                          <td>
                            <div className="table-actions">
                              <button className="icon-btn edit" title="Edit"><Edit size={16} /></button>
                              <button className="icon-btn delete" title="Delete"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="admin-card"
              >
                <div className="card-header">
                  <h2>Platform Settings</h2>
                  <p>Manage global configuration for the Saarthi platform.</p>
                </div>
                <div className="settings-placeholder">
                  <Settings size={48} />
                  <h3>Work in Progress</h3>
                  <p>Global platform controls (commission rates, safety protocols, etc.) are currently being integrated.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
export default AdminPanel;
