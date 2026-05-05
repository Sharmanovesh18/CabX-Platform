import React from "react";
import { Link } from "react-router-dom";
import { 
  Instagram, 
  Facebook, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Twitter
} from "lucide-react";
import "./Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-text">SAARTHI</span>
          </div>
          <p className="brand-desc">
            Your trusted travel companion, providing secure and sustainable car-pooling solutions across the country.
          </p>
          <div className="social-links">
            <a href="#" className="social-link"><Instagram size={20} /></a>
            <a href="#" className="social-link"><Facebook size={20} /></a>
            <a href="#" className="social-link"><Twitter size={20} /></a>
            <a href="#" className="social-link"><Youtube size={20} /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><Link to="/help">Help Center</Link></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">For Business</a></li>
            <li><a href="#">Sustainability</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Account</h4>
          <ul className="footer-links">
            <li><Link to="/register">Create Account</Link></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><a href="#">iOS App</a></li>
            <li><a href="#">Android App</a></li>
          </ul>
        </div>

        <div className="footer-col contact-col">
          <h4 className="footer-heading">Contact Us</h4>
          <ul className="contact-list">
            <li>
              <MapPin size={18} className="contact-icon" />
              <span>623 Urban Estate, Gurugram, Haryana</span>
            </li>
            <li>
              <Phone size={18} className="contact-icon" />
              <a href="tel:9512016370">951-201-6370</a>
            </li>
            <li>
              <Mail size={18} className="contact-icon" />
              <a href="mailto:hello@saarthi.com">hello@saarthi.com</a>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              &copy; {year} Saarthi Technologies. All rights reserved.
            </p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
