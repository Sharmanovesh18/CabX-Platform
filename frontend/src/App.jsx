import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"

import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import Loader from "./components/Loader";
import DashBoard from "./components/DashBoard";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/ErrorFallback";
// import Footer from "./components/Footer";
import ReviewPage from "./components/ReviewPage";
import Location from "./components/MapPage";
import ChatSupport from "./components/chatbot"; 
import CtaStyles from "./components/Download"; 
// import DiscountCTA from "./components/Animation";
import Profile from "./components/Profile";
import Payment from "./components/Payment";
import HelpPage from "./components/HelpPage";
import Driver from "./components/Driver";
import AdminPanel from "./components/AdminPanel";

function Layout({ children }) {
  const location = useLocation();
  const hideFooterAndCTA = ["/register", "/reviews", "/location"];


  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "110px", minHeight: "80vh" }}>
        {children}
      </main>

      {/* Chat Support always visible */}
      <ChatSupport />
      
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // if (loading) {
  //   return <Loader />;
  // }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/dashboard"
            element={
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <DashBoard />
              </ErrorBoundary>
            }
          />
          <Route path="/reviews" element={<ReviewPage />} />
          <Route path="/location" element={<Location />} />

          <Route path="/profile" element={<Profile />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/help" element={<HelpPage />} />

          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
