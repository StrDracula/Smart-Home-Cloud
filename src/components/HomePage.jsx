import React from 'react';
import { BsDisplay } from "react-icons/bs";
import { IoIosSwitch } from "react-icons/io";
import { IoHome } from "react-icons/io5";
import { LuBookUser } from "react-icons/lu";
import { MdNotificationsActive, MdOutlineSecurity } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';
import { useAuth } from './AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  const handleGetStarted = () => {
    if (currentUser) {
      // Redirect to the dashboard based on the user's role
      navigate(`/dashboard/${userRole || 'admin'}`);
    } else {
      navigate('/role-selection');
    }
  };

  const handleDashboard = () => {
    // Redirect to the dashboard based on the user's role
    navigate(`/dashboard/${userRole || 'admin'}`);
  };

  return (
    <div className="main-container">
      {/* Navigation */}
      <header className="nav-header">
        <div className="logo-container">
          <IoHome className="logo-icon" size={24}/>
          <span className="logo-text">Smart Home</span>
        </div>
        <div className="auth-buttons">
          {currentUser ? (
            <>
              <span className="welcome-text">
                Welcome, {currentUser.displayName || currentUser.email}
                {userRole && <span className="role-tag"> ({userRole})</span>}
              </span>
              <button className="dashboard-btn" onClick={handleDashboard}>
                Go to Dashboard
              </button>
            </>
          ) : (
            <button className="sign-in-btn" onClick={handleGetStarted}>
              Get Started
            </button>
          )}
        </div>
      </header>

      {/* Hero Section with Image Background */}
      <div className="hero-container hero-background">
        <div className="overlay">
          <div className="hero-content-overlay">
            <h1>Welcome to the future of<br/><span className="highlight">Smart Living</span></h1>
            <p>Control your entire home with a single tap.<br/>Experience the next level of comfort and security.</p>
            <button className="get-started-btn" onClick={handleGetStarted}>
              {currentUser ? 'Go to Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="features-title">FEATURES</h2>
        <h3 className="features-subtitle">Everything you need to control your home</h3>
        
        <div className="features-container">
          {/* Device Monitoring */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <BsDisplay className="feature-icon" />
            </div>
            <h4 className="feature-name">Device Monitoring</h4>
            <p className="feature-description">
            Track the status and activity of all connected home devices from anywhere, anytime.
            </p>
          </div>

          {/* Role Based Access */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <LuBookUser className="feature-icon" />
            </div>
            <h4 className="feature-name">Role-Based Access</h4>
            <p className="feature-description">
            Assign custom roles to users, allowing selective control and visibility of smart devices within the home.            </p>
          </div>

          {/* Advanced Security */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <MdOutlineSecurity className="feature-icon" />
            </div>
            <h4 className="feature-name">Advanced Security</h4>
            <p className="feature-description">
            Enhance home safety with real-time threat detection and access control for critical systems.            </p>
          </div>

          {/* Manual Control */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <IoIosSwitch className="feature-icon" />
            </div>
            <h4 className="feature-name">Manual Control</h4>
            <p className="feature-description">
            Easily operate home devices like lights, fans, and thermostats directly through the website or mobile app.            </p>
          </div>

          {/* Automated Alerts */}
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <MdNotificationsActive className="feature-icon" />
            </div>
            <h4 className="feature-name">Automated Alerts</h4>
            <p className="feature-description">
            Get real-time alerts for important events like gas leaks, fire, motion detection, and regular updates such as user logins or device access.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;