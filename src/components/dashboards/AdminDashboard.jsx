import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { BsDisplay, BsHouseDoor } from 'react-icons/bs';
import { FaUserCog, FaUsers } from 'react-icons/fa';
import { IoIosNotifications } from 'react-icons/io';
import { MdOutlineAnalytics, MdOutlineSecurity, MdSettings } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/Dashboard.css';
import { useAuth } from '../AuthContext';
import { auth, db } from '../firebase';

const AdminDashboardTable = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [adminId, setAdminId] = useState('');
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [securityActivity, setSecurityActivity] = useState([]);

  // Fetch admin details and data on component mount
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        if (currentUser) {
          // Get admin ID (generate if not exists)
          const adminDocRef = doc(db, "users", currentUser.uid);
          const adminDoc = await getDoc(adminDocRef);
          
          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            setAdminId(adminData.adminId || generateAdminId(currentUser.uid));
            
            // Fetch associated users
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersData = [];
            usersSnapshot.forEach((doc) => {
              const userData = doc.data();
              if (userData.adminId === adminData.adminId) {
                usersData.push({
                  id: doc.id,
                  ...userData
                });
              }
            });
            setUsers(usersData);
            
            // Mock devices and alerts data for demonstration
            setDevices(getMockDevices());
            setAlerts(getMockAlerts());
            setSecurityActivity(getMockSecurityActivity());
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load dashboard data");
        setIsLoading(false);
      }
    };
    
    fetchAdminData();
  }, [currentUser]);

  const generateAdminId = (uid) => {
    // Generate a unique admin ID based on the user ID
    return `admin-${uid.substring(0, 8)}`;
  };

  const getMockDevices = () => {
    return [
      { id: 1, name: 'Living Room Light', type: 'light', status: 'on', lastActive: '5 mins ago' },
      { id: 2, name: 'Kitchen Thermostat', type: 'thermostat', status: 'on', lastActive: '2 mins ago', value: '22°C' },
      { id: 3, name: 'Front Door Lock', type: 'lock', status: 'locked', lastActive: '1 hour ago' },
      { id: 4, name: 'Bedroom AC', type: 'climate', status: 'off', lastActive: '6 hours ago' },
      { id: 5, name: 'Garage Door', type: 'door', status: 'closed', lastActive: '2 days ago' },
      { id: 6, name: 'Security Camera', type: 'camera', status: 'on', lastActive: 'Just now' }
    ];
  };

  const getMockAlerts = () => {
    return [
      { id: 1, type: 'security', message: 'Motion detected at front door', timestamp: '2 mins ago', severity: 'high' },
      { id: 2, type: 'device', message: 'Kitchen light disconnected', timestamp: '1 hour ago', severity: 'medium' },
      { id: 3, type: 'user', message: 'Guest login: Alex Smith', timestamp: '3 hours ago', severity: 'low' },
      { id: 4, type: 'system', message: 'Software update available', timestamp: '5 hours ago', severity: 'low' }
    ];
  };

  const getMockSecurityActivity = () => {
    return [
      { id: 1, time: 'Today, 10:32 AM', event: 'Front door unlocked by Jane (Family)' },
      { id: 2, time: 'Today, 8:15 AM', event: 'Motion detected in living room' },
      { id: 3, time: 'Yesterday, 7:45 PM', event: 'Security system armed' },
      { id: 4, time: 'Yesterday, 6:22 PM', event: 'Guest user "Alex" accessed front door' }
    ];
  };

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

  const handleToggleDevice = (deviceId) => {
    setDevices(devices.map(device => {
      if (device.id === deviceId) {
        const newStatus = device.status === 'on' ? 'off' : 'on';
        return { ...device, status: newStatus };
      }
      return device;
    }));
    toast.success('Device status updated!');
  };

  const copyAdminId = () => {
    navigator.clipboard.writeText(adminId);
    toast.info('Admin ID copied to clipboard!');
  };

  const handleAlertResolve = (alertId) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
    toast.success('Alert resolved successfully!');
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <BsHouseDoor className="logo-icon" />
          <h3>SmartHome</h3>
        </div>
        <div className="sidebar-menu">
          <div 
            className={`sidebar-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <MdOutlineAnalytics className="sidebar-icon" />
            <span>Overview</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveSection('devices')}
          >
            <BsDisplay className="sidebar-icon" />
            <span>Devices</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <FaUsers className="sidebar-icon" />
            <span>Users</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSection('security')}
          >
            <MdOutlineSecurity className="sidebar-icon" />
            <span>Security</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveSection('alerts')}
          >
            <IoIosNotifications className="sidebar-icon" />
            <span>Notifications</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            <MdSettings className="sidebar-icon" />
            <span>Settings</span>
          </div>
        </div>
      </div>
      
      <div className="main-content">
        <div className="dashboard-header">
          <div className="user-info">
            <h1>Admin Dashboard</h1>
            <p>Welcome, {currentUser?.displayName || currentUser?.email || 'Administrator'}</p>
          </div>
          <div className="header-actions">
            <button className="admin-id-btn" onClick={copyAdminId}>
              <FaUserCog className="btn-icon" />
              Admin ID: {adminId}
            </button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        
        <div className="dashboard-content">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="dashboard-section">
              <h2 className="section-title">System Overview</h2>
              <div className="stat-cards">
                <div className="stat-card">
                  <h3>Devices</h3>
                  <p className="stat-number">{devices.length}</p>
                  <p className="stat-text">{devices.filter(d => d.status === 'on').length} devices active</p>
                </div>
                <div className="stat-card">
                  <h3>Users</h3>
                  <p className="stat-number">{users.length}</p>
                  <p className="stat-text">Family members & guests</p>
                </div>
                <div className="stat-card">
                  <h3>Alerts</h3>
                  <p className="stat-number">{alerts.length}</p>
                  <p className="stat-text">{alerts.filter(a => a.severity === 'high').length} high priority</p>
                </div>
                <div className="stat-card">
                  <h3>System Status</h3>
                  <p className="stat-number status-ok">Online</p>
                  <p className="stat-text">All systems operational</p>
                </div>
              </div>
              
              <h3>Recent Alerts</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Message</th>
                      <th>Time</th>
                      <th>Severity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map(alert => (
                      <tr key={alert.id} className={`severity-${alert.severity}`}>
                        <td>{alert.type}</td>
                        <td>{alert.message}</td>
                        <td>{alert.timestamp}</td>
                        <td>
                          <span className={`severity-badge ${alert.severity}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td>
                          <button className="table-action-btn" onClick={() => handleAlertResolve(alert.id)}>
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <h3>Active Devices</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Device Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map(device => (
                      <tr key={device.id}>
                        <td>{device.name}</td>
                        <td>{device.type}</td>
                        <td>
                          <span className={`status-badge ${device.status}`}>
                            {device.status}
                          </span>
                        </td>
                        <td>{device.lastActive}</td>
                        <td>{device.value || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Devices Section */}
          {activeSection === 'devices' && (
            <div className="dashboard-section">
              <h2 className="section-title">Device Management</h2>
              <div className="device-controls">
                <button className="control-btn">
                  <span className="btn-icon">+</span> Add Device
                </button>
                <div className="device-filters">
                  <select className="device-filter">
                    <option>All Rooms</option>
                    <option>Living Room</option>
                    <option>Kitchen</option>
                    <option>Bedroom</option>
                    <option>Garage</option>
                  </select>
                  <select className="device-filter">
                    <option>All Types</option>
                    <option>Lights</option>
                    <option>Thermostats</option>
                    <option>Locks</option>
                    <option>Cameras</option>
                  </select>
                </div>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Device Name</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th>Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devices.map(device => (
                      <tr key={device.id}>
                        <td>{device.name}</td>
                        <td>{device.type}</td>
                        <td>
                          <span className={`status-badge ${device.status}`}>
                            {device.status}
                          </span>
                        </td>
                        <td>{device.lastActive}</td>
                        <td>{device.value || '-'}</td>
                        <td>
                          <div className="table-actions">
                            <button 
                              className={`toggle-btn ${device.status === 'on' ? 'on' : 'off'}`}
                              onClick={() => handleToggleDevice(device.id)}
                            >
                              {device.status === 'on' ? 'Turn Off' : 'Turn On'}
                            </button>
                            <button className="settings-btn">
                              <MdSettings />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Users Section */}
          {activeSection === 'users' && (
            <div className="dashboard-section">
              <h2 className="section-title">User Management</h2>
              <div className="user-controls">
                <button className="control-btn">
                  <span className="btn-icon">+</span> Invite User
                </button>
                <div className="user-filters">
                  <select className="user-filter">
                    <option>All Roles</option>
                    <option>Family</option>
                    <option>Guest</option>
                  </select>
                </div>
              </div>
              
              <div className="admin-id-section">
                <div className="admin-id-card">
                  <h3>Your Admin ID</h3>
                  <p className="admin-id-value">{adminId}</p>
                  <p className="admin-id-info">Share this ID with family members and guests when they sign up to connect their accounts to your smart home.</p>
                  <button className="copy-admin-id" onClick={copyAdminId}>
                    Copy Admin ID
                  </button>
                </div>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map((user, index) => (
                        <tr key={index}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`role-badge ${user.role}`}>{user.role}</span>
                          </td>
                          <td>{new Date(user.createdAt?.toDate()).toLocaleDateString()}</td>
                          <td>
                            <span className="status-badge active">Active</span>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="table-action-btn">Edit</button>
                              <button className="table-action-btn delete">Remove</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-data">
                          No users connected to your account yet.
                          Share your Admin ID with family members or guests to connect them.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="dashboard-section">
              <h2 className="section-title">Security Controls</h2>
              <div className="security-cards">
                <div className="security-card">
                  <div className="security-icon">
                    <MdOutlineSecurity />
                  </div>
                  <h3>System Status</h3>
                  <div className="security-status active">Protected</div>
                  <p>Your security system is active and monitoring your home.</p>
                  <button className="security-btn">Security Settings</button>
                </div>
                
                <div className="security-card">
                  <div className="security-icon">
                    <FaUsers />
                  </div>
                  <h3>Access Control</h3>
                  <p>Manage which users can access specific devices and areas.</p>
                  <button className="security-btn">Configure Access</button>
                </div>
                
                <div className="security-card">
                  <div className="security-icon">
                    <IoIosNotifications />
                  </div>
                  <h3>Security Alerts</h3>
                  <p>Customize when and how you receive security notifications.</p>
                  <button className="security-btn">Alert Settings</button>
                </div>
              </div>
              
              <h3>Recent Security Activity</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Event</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityActivity.map(activity => (
                      <tr key={activity.id}>
                        <td>{activity.time}</td>
                        <td>{activity.event}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Alerts Section */}
          {activeSection === 'alerts' && (
            <div className="dashboard-section">
              <h2 className="section-title">Notifications & Alerts</h2>
              <div className="alerts-controls">
                <div className="alert-filters">
                  <button className="filter-btn active">All</button>
                  <button className="filter-btn">Security</button>
                  <button className="filter-btn">Devices</button>
                  <button className="filter-btn">Users</button>
                  <button className="filter-btn">System</button>
                </div>
                <select className="priority-filter">
                  <option>All Priorities</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Message</th>
                      <th>Time</th>
                      <th>Severity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map(alert => (
                      <tr key={alert.id} className={`severity-row-${alert.severity}`}>
                        <td>{alert.type}</td>
                        <td>{alert.message}</td>
                        <td>{alert.timestamp}</td>
                        <td>
                          <span className={`severity-badge ${alert.severity}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="table-action-btn" onClick={() => handleAlertResolve(alert.id)}>
                              Resolve
                            </button>
                            <button className="table-action-btn secondary">Details</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <h3>Notification Settings</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Notification Type</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Security Alerts</td>
                      <td>Get notifications for motion detection, door/window openings</td>
                      <td>
                        <label className="toggle-switch">
                          <input type="checkbox" checked onChange={() => {}} />
                          <span className="toggle-slider"></span>
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td>Device Status Changes</td>
                      <td>Get notified when devices go offline or malfunction</td>
                      <td>
                        <label className="toggle-switch">
                          <input type="checkbox" checked onChange={() => {}} />
                          <span className="toggle-slider"></span>
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td>User Login Activity</td>
                      <td>Notifications when users log in or make changes</td>
                      <td>
                        <label className="toggle-switch">
                          <input type="checkbox" onChange={() => {}} />
                          <span className="toggle-slider"></span>
                        </label>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="dashboard-section">
              <h2 className="section-title">System Settings</h2>
              
              <div className="settings-grid">
                <div className="settings-card">
                  <h3>Profile Settings</h3>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Name</label>
                      <input type="text" value={currentUser?.displayName || ''} />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={currentUser?.email || ''} disabled />
                    </div>
                    <button className="settings-save-btn">Update Profile</button>
                  </div>
                </div>
                
                <div className="settings-card">
                  <h3>Home Settings</h3>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Home Name</label>
                      <input type="text" placeholder="My Smart Home" />
                    </div>
                    <div className="form-group">
                      <label>Time Zone</label>
                      <select>
                        <option>UTC-8 - Pacific Time</option>
                        <option>UTC-7 - Mountain Time</option>
                        <option>UTC-6 - Central Time</option>
                        <option>UTC-5 - Eastern Time</option>
                        <option>UTC+0 - Greenwich Mean Time</option>
                      </select>
                    </div>
                    <button className="settings-save-btn">Save Settings</button>
                  </div>
                </div>
                
                <div className="settings-card">
                  <h3>System Preferences</h3>
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Setting</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Dark Mode</td>
                          <td>
                            <label className="toggle-switch">
                              <input type="checkbox" onChange={() => {}} />
                              <span className="toggle-slider"></span>
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>Email Notifications</td>
                          <td>
                            <label className="toggle-switch">
                              <input type="checkbox" checked onChange={() => {}} />
                              <span className="toggle-slider"></span>
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td>Auto-logout after inactivity</td>
                          <td>
                            <label className="toggle-switch">
                              <input type="checkbox" checked onChange={() => {}} />
                              <span className="toggle-slider"></span>
                            </label>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="settings-card danger">
                  <h3>Advanced Settings</h3>
                  <div className="danger-actions">
                    <button className="danger-btn">Reset System Settings</button>
                    <button className="danger-btn">Unlink All Devices</button>
                    <button className="danger-btn critical">Delete Account</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardTable;