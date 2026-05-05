import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut, ChevronDown, MapPin, Star, HelpCircle, Home, Car, ShieldCheck } from "lucide-react";
import "./Navbar.css";
import AuthModal from "./AuthModal";

function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) setCurrentUser(user);

    const handleAuthChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("currentUser"));
      setCurrentUser(updatedUser);
    };

    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/", icon: <Home size={18} /> },
    { name: "Rides", path: "/dashboard", icon: <Car size={18} /> },
    { name: "Reviews", path: "/reviews", icon: <Star size={18} /> },
    { name: "Help", path: "/help", icon: <HelpCircle size={18} /> },
    { name: "Location", path: "/location", icon: <MapPin size={18} /> },
  ];

  if (currentUser?.role === 'Admin') {
    navLinks.push({ name: "Admin Panel", path: "/admin", icon: <ShieldCheck size={18} /> });
  }

  return (
    <header className={`NavBar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="nav-container container">
        <div className="logo" onClick={() => navigate("/")}>
          <div className="logo-icon">S</div>
          <span className="logo-text">SAARTHI</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="nav-links desktop-only">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={location.pathname === link.path ? 'active' : ''}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          {currentUser ? (
            <div className="profile-dropdown">
              <button className="profile-btn premium-btn">
                <User size={18} /> 
                <span className="user-name">{currentUser.name.split(" ")[0]}</span>
                <ChevronDown size={14} className="dropdown-arrow" />
              </button>
              <div className="dropdown-content">
                {currentUser.role === 'Admin' && (
                  <Link to="/admin"><ShieldCheck size={14} /> Admin Panel</Link>
                )}
                <Link to="/profile"><User size={14} /> Profile</Link>
                <button onClick={handleLogout} className="logout-btn">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <button className="login-btn premium-btn desktop-only" onClick={() => setAuthOpen(true)}>
              Login / Signup
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.nav 
            className="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="mobile-nav-content">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={location.pathname === link.path ? 'active' : ''}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon} {link.name}
                </Link>
              ))}
              {!currentUser && (
                <button 
                  className="mobile-login-btn" 
                  onClick={() => { setAuthOpen(true); setIsMobileMenuOpen(false); }}
                >
                  Login / Signup
                </button>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </header>
  );
}

export default Navbar;
