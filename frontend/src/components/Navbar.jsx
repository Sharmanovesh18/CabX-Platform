import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import AuthModal from "./AuthModal";

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) setCurrentUser(user);

    const handleAuthChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("currentUser"));
      setCurrentUser(updatedUser);
    };

    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);

    window.dispatchEvent(new Event("auth-changed"));

    navigate("/");
  };

  return (
    <header className="NavBar">
      <div className="logo">
        <img src="logo.jpg" alt="Saarthi Logo" className="logo-img" />
        <span className="logo-text">SAARTHI</span>
      </div>

      <nav className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Rides</Link>
        <Link to="/reviews">Reviews</Link>
        {/* <Link to="/offers">Offers</Link> */}
        <Link to="/help">Help</Link>
        {/* <Link to="/contact">Contact</Link> */}
        <Link to="/location">Location</Link>
        <Link to="/driver">Driver</Link>
      </nav>

      {currentUser ? (
        <div className="profile-dropdown">
          <button className="profile-btn">
            Hello {currentUser.name.split(" ")[0]}
          </button>
          <div className="dropdown-content">
            <Link to="/profile">Profile</Link>
            <button onClick={handleLogout}>Sign Out</button>
          </div>
        </div>
      ) : (
        <>
          <button className="login-btn" onClick={() => setAuthOpen(true)}>Login / Signup</button>
          <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
        </>
      )}
    </header>
  );
}

export default Navbar;
