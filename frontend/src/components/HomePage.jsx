import "./HomePage.css";
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  ShieldCheck, 
  MapPin, 
  CreditCard, 
  Clock, 
  Car, 
  Bus, 
  Key, 
  Package, 
  Star,
  ChevronRight,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import Footer from "./Footer";
import DiscountCTA from "./Animation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

function HomePage() {
  const [value, setValue] = useState("");
  const location = useLocation();
  const hideFooterAndCTA = ["/dashboard", "/login", "/register"];
  const shouldHide = hideFooterAndCTA.includes(location.pathname);

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <motion.div className="hero-images" variants={containerVariants}>
          <div className="car-showcase">
            <motion.img 
              src="/hero-car.png" 
              alt="Sleek Modern Car" 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
            <div className="car-reflection"></div>
          </div>
        </motion.div>

        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Sustainable Travel, <span className="highlight-text">Reimagined</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Your trusted companion for city rides, outstation travel, and car rentals. Professional, secure, and always on time.
          </motion.p>
          
          <motion.div 
            className="booking-box glass-effect"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="booking-form">
              <div className="input-group">
                <label><Calendar size={18} /> Schedule</label>
                <select 
                  value={value} 
                  onChange={(e) => setValue(e.target.value)}
                  className="modern-select"
                >
                  <option value="" disabled hidden>Choose time</option>
                  <option value="now">Immediate Ride</option>
                  <option value="later">Schedule for Later</option>
                </select>
              </div>

              <Link to="/dashboard" className="search-link">
                <button className="search-btn">
                  Search Ride <ChevronRight size={20} />
                </button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Why Us */}
      <section className="why-us">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >Why Choose Saarthi</motion.h2>
          
          <motion.div 
            className="features"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: <CreditCard size={32} className="feature-icon" />, title: "Secure Payments", desc: "Multiple encrypted payment options for your safety." },
              { icon: <MapPin size={32} className="feature-icon" />, title: "Live Tracking", desc: "Share your trip status with loved ones in real-time." },
              { icon: <ShieldCheck size={32} className="feature-icon" />, title: "Verified Drivers", desc: "Every driver undergoes rigorous background checks." },

              { icon: <Clock size={32} className="feature-icon" />, title: "24/7 Support", desc: "Our dedicated support team is always here to help." }
            ].map((f, i) => (
              <motion.div key={i} className="feature-card premium-card" variants={itemVariants}>
                <div className="icon-wrapper">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >Premium Services</motion.h2>
          <motion.div 
            className="service-cards"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { icon: <Car size={40} />, title: "City Rides", desc: "Quick commutes across the city." },
              { icon: <Bus size={40} />, title: "Outstation", desc: "Comfortable long-distance travel." },
              { icon: <Key size={40} />, title: "Car Rentals", desc: "Self-drive or with a driver." },
              { icon: <Package size={40} />, title: "Parcel Delivery", desc: "Safe delivery of your packages." }
            ].map((s, i) => (
              <motion.div key={i} className="card premium-card" variants={itemVariants} whileHover={{ y: -10 }}>
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="card-footer">
                  <span className="learn-more">Learn more <ChevronRight size={16} /></span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >What Our Passengers Say</motion.h2>
          <motion.div 
            className="reviews"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { text: "Best ride experience ever! The driver was professional and the car was spotless.", author: "Rajesh K.", rating: 5 },
              { text: "Affordable and reliable service for my daily office commute. Highly recommended.", author: "Priya S.", rating: 4 },
              { text: "Very safe for night travel. I always feel secure booking with Saarthi.", author: "Anjali M.", rating: 5 }
            ].map((r, i) => (
              <motion.div key={i} className="review premium-card" variants={itemVariants}>
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < r.rating ? "#eab308" : "none"} color={i < r.rating ? "#eab308" : "#cbd5e1"} />
                  ))}
                </div>
                <p>"{r.text}"</p>
                <div className="reviewer-info">
                  <div className="avatar">{r.author[0]}</div>
                  <span className="author-name">{r.author}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      {!shouldHide && (
        <>
          <DiscountCTA />
          <Footer />
        </>
      )}
    </div>
  );
}


export default HomePage;

