import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { BsDisplay, BsHouseDoor } from 'react-icons/bs';
import { FaUserCircle } from 'react-icons/fa';
import { IoIosNotifications } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/Dashboard.css';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [assignedDevices, setAssignedDevices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('devices');

  useEffect(() => {
    // Simulate fetching assigned devices from the database
    setTimeout(() => {
      setAssignedDevices([
        { id: 1, name: 'Guest Room Light', type: 'light', status: 'off', brightness: 80, location: 'Guest Room' },
        { id: 2, name: 'Guest Room Fan', type: 'fan', status: 'on', speed: 2, location: 'Guest Room' },
        { id: 3, name: 'Guest Bathroom Light', type: 'light', status: 'off', brightness: 100, location: 'Guest Bathroom' },
        { id: 4, name: 'Bedside Lamp', type: 'light', status: 'on', brightness: 60, location: 'Guest Room' }
      ]);

      setNotifications([
        { id: 1, message: 'Your fan was turned off automatically to save power.', time: '1 hour ago', read: false, type: 'device' },
        { id: 2, message: 'Guest Room Light was turned on.', time: '3 hours ago', read: true, type: 'device' },
        { id: 3, message: 'Welcome to Smart Home! You have access to 4 devices.', time: '1 day ago', read: true, type: 'info' }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
      console.error('Logout error:', error);
    }
  };

  const toggleDeviceStatus = (deviceId) => {
    setAssignedDevices(assignedDevices.map(device => {
      if (device.id === deviceId) {
        const newStatus = device.status === 'on' ? 'off' : 'on';
        toast.info(`${device.name} turned ${newStatus}`);
        return { ...device, status: newStatus };
      }
      return device;
    }));
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(notification => 
      notification.id === notificationId ? { ...notification, read: true } : notification
    ));
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <BsHouseDoor className="logo-icon" />
          <h3>SmartHome</h3>
        </div>
        
        <div className="sidebar-menu">
          <div 
            className={`sidebar-item ${activeTab === 'devices' ? 'active' : ''}`} 
            onClick={() => setActiveTab('devices')}
          >
            <BsDisplay className="sidebar-icon" />
            <span>My Devices</span>
          </div>
          
          <div 
            className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`} 
            onClick={() => setActiveTab('notifications')}
          >
            <IoIosNotifications className="sidebar-icon" />
            <span>Notifications</span>
          </div>
          
          <div 
            className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => setActiveTab('profile')}
          >
            <FaUserCircle className="sidebar-icon" />
            <span>My Profile</span>
          </div>
        </div>
        
        <div style={{ marginTop: 'auto' }}>
          <div className="sidebar-item" onClick={handleLogout}>
            <span className="sidebar-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </div>
      
      
      {/* Main Content */}
      <div className="main-content">
        <div className="dashboard-header">
          <div className="user-info">
            <h1>Guest Dashboard</h1>
            <p>Welcome, {currentUser?.displayName || currentUser?.email || 'Guest'}</p>
          </div>
          <div className="header-actions">
            <span className="role-badge guest">Guest Access</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        
        {/* Devices Tab */}
        {activeTab === 'devices' && (
          <div className="dashboard-section">
            <div className="section-title">My Assigned Devices</div>
            
            <div className="stat-cards">
              <div className="stat-card">
                <div className="stat-number">{assignedDevices.length}</div>
                <div className="stat-text">Total Devices</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{assignedDevices.filter(d => d.status === 'on').length}</div>
                <div className="stat-text">Devices On</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">2</div>
                <div className="stat-text">Rooms</div>
              </div>
            </div>
            
            <div className="section-title">Control Your Devices</div>
            <div className="device-list">
              {assignedDevices.map(device => (
                <div key={device.id} className="device-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="device-name">
                      {device.name}
                      <span 
                        className={`device-status-indicator ${device.status === 'on' ? 'online' : 'offline'}`}
                      ></span>
                    </span>
                    <span className="status-badge" style={{ fontSize: '0.75rem' }}>{device.location}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span className={`status-badge ${device.status}`}>
                      {device.status === 'on' ? 'ON' : 'OFF'}
                    </span>
                    <button 
                      onClick={() => toggleDeviceStatus(device.id)}
                      style={{ margin: '0' }}
                    >
                      {device.status === 'on' ? 'Turn Off' : 'Turn On'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="dashboard-section">
            <div className="section-title">My Notifications</div>
            
            <div className="alerts-list">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`alert-item ${!notification.read ? 'severity-medium' : ''}`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div>
                      <div className="alert-type">{notification.message}</div>
                      <div className="alert-time">{notification.time}</div>
                    </div>
                    {!notification.read && (
                      <span className="alert-type-badge device">New</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-data">No notifications at this time</div>
              )}
            </div>
          </div>
        )}
        
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="dashboard-section">
            <div className="section-title">My Profile</div>
            
            <div className="device-card" style={{ maxWidth: '500px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#27667B', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginRight: '20px' }}>
                  {(currentUser?.displayName || 'G')[0].toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: '0', color: '#143D60' }}>{currentUser?.displayName || currentUser?.email || 'Guest'}</h3>
                  <div className="role-badge guest">Guest Access</div>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#143D60', borderBottom: '1px solid #DDEB9D', paddingBottom: '5px' }}>Access Summary</h4>
                <p><strong>Email:</strong> {currentUser?.email || 'guest@example.com'}</p>
                <p><strong>Last Login:</strong> Today at 2:30 PM</p>
                <p><strong>Access Level:</strong> Guest (Limited)</p>
                <p><strong>Assigned Areas:</strong> Guest Room, Guest Bathroom</p>
              </div>
              
              <div>
                <h4 style={{ color: '#143D60', borderBottom: '1px solid #DDEB9D', paddingBottom: '5px' }}>Need More Access?</h4>
                <p>To request additional access or report issues, please contact the home administrator.</p>
                <button>Request Additional Access</button>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer Notice */}
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#666', fontSize: '0.85rem' }}>
          Guest Mode • Limited Access • Smart Home System
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;