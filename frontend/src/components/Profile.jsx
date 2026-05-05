import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "./Profile.css";

function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      // redirecting to /login breaks because we use a modal-based auth flow.
      // Send user to home where they can open the login modal instead.
      navigate("/");
      return;
    }

    // We store a lightweight user on login/register (no phone). Fetch full profile
    // from server using the stored token so phone and other fields are populated.
    const fetchProfile = async () => {
      try {
        // optimistic: show stored data first if available
        setUser(currentUser);
        if (!currentUser.token) return;
        const res = await axios.get('http://localhost:5001/api/auth/profile', {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        if (res?.data) {
          setUser(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch full profile:', err?.response?.data || err.message);
        // keep the lightweight user in case of error
      }
    };

    fetchProfile();
  }, [navigate]);

  if (!user) return (
    <div className="profile-container">
      <h2>Please sign in</h2>
      <p>Open the Login/Signup modal from the top-right to view your profile.</p>
    </div>
  );

  return (
    <div className="profile-container">
      <h1>Welcome, {user.name} 👋</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Contact:</strong> {user.phone}</p>
      {user.role && <p><strong>Role:</strong> {user.role}</p>}
      {/* don't show password or token values in UI for security */}
    </div>
  );
}

export default Profile;
