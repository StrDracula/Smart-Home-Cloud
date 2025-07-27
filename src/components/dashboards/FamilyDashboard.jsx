import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { BsDisplay, BsHouseDoor } from 'react-icons/bs';
import { FaUserCircle, FaUsers } from 'react-icons/fa';
import { IoIosNotifications, IoIosSwitch } from 'react-icons/io';
import { MdOutlineEnergySavingsLeaf } from 'react-icons/md';
import { TbDeviceAnalytics } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/Dashboard.css';
import { useAuth } from '../AuthContext';
import { auth, db } from '../firebase';

const FamilyDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [adminId, setAdminId] = useState('');

  // Fetch family user data and connected devices on component mount
  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        if (currentUser) {
          // Get user document
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAdminId(userData.adminId || '');
            
            // Fetch other family members with same adminId
            if (userData.adminId) {
              const usersSnapshot = await getDocs(collection(db, "users"));
              const familyMembersList = [];
              usersSnapshot.forEach((doc) => {
                const memberData = doc.data();
                if (memberData.adminId === userData.adminId) {
                  familyMembersList.push({
                    id: doc.id,
                    ...memberData,
                    status: 'active', // Adding a status for demo purposes
                    lastActive: getRandomLastActive(), // Adding random last active time for demo
                    joinedDate: getRandomJoinedDate() // Adding random joined date for demo
                  });
                }
              });
              setFamilyMembers(familyMembersList);
            }
            
            // Mock devices and alerts data for demonstration
            setDevices(getMockDevices());
            setAlerts(getMockAlerts());
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching family data:", error);
        toast.error("Failed to load dashboard data");
        setIsLoading(false);
      }
    };
    
    fetchFamilyData();
  }, [currentUser]);

  // Helper function to generate random last active time for demo
  const getRandomLastActive = () => {
    const options = ['Just now', '5 mins ago', '30 mins ago', '1 hour ago', '3 hours ago', 'Yesterday'];
    return options[Math.floor(Math.random() * options.length)];
  };

  // Helper function to generate random joined date for demo
  const getRandomJoinedDate = () => {
    const start = new Date(2023, 0, 1);
    const end = new Date();
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return randomDate.toLocaleDateString();
  };

  const getMockDevices = () => {
    return [
      { id: 1, name: 'Living Room Light', type: 'light', status: 'on', lastActive: '5 mins ago', location: 'Living Room', accessible: true, energyUsage: '5W' },
      { id: 2, name: 'Kitchen Thermostat', type: 'thermostat', status: 'on', lastActive: '2 mins ago', value: '22°C', location: 'Kitchen', accessible: true, energyUsage: '350W' },
      { id: 3, name: 'Front Door Lock', type: 'lock', status: 'locked', lastActive: '1 hour ago', location: 'Front Door', accessible: false, energyUsage: '1W' },
      { id: 4, name: 'Bedroom Fan', type: 'fan', status: 'off', lastActive: '6 hours ago', location: 'Bedroom', accessible: true, energyUsage: '0W' },
      { id: 5, name: 'Family Room TV', type: 'entertainment', status: 'off', lastActive: '3 hours ago', location: 'Family Room', accessible: true, energyUsage: '0W' },
      { id: 6, name: 'Gas Sensor', type: 'safety', status: 'on', lastActive: 'Just now', location: 'Kitchen', accessible: false, view: 'restricted', reading: 'Normal' },
      { id: 7, name: 'Water Sprinkler', type: 'safety', status: 'ready', lastActive: '12 hours ago', location: 'Garden', accessible: false, view: 'status-only' }
    ];
  };

  const getMockAlerts = () => {
    return [
      { id: 1, type: 'safety', message: 'Motion detected at front door', timestamp: '2 mins ago', severity: 'medium' },
      { id: 2, type: 'device', message: 'Kitchen light disconnected', timestamp: '1 hour ago', severity: 'low' },
      { id: 3, type: 'user', message: 'Dad logged in', timestamp: '3 hours ago', severity: 'info' },
      { id: 4, type: 'energy', message: 'AC running with windows open', timestamp: '5 hours ago', severity: 'medium' }
    ];
  };

  const getRecentActivities = () => {
    return [
      { id: 1, device: 'Living Room Light', action: 'turned on', user: 'Mom', timestamp: '10 mins ago' },
      { id: 2, device: 'Front Door', action: 'locked', user: 'Dad', timestamp: '45 mins ago' },
      { id: 3, device: 'Thermostat', action: 'set to 22°C', user: 'You', timestamp: '1 hour ago' },
      { id: 4, device: 'Kitchen Fan', action: 'turned off', user: 'System', timestamp: '3 hours ago' }
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
      if (device.id === deviceId && device.accessible) {
        const newStatus = device.status === 'on' ? 'off' : 'on';
        return { ...device, status: newStatus };
      }
      return device;
    }));
    toast.success('Device status updated!');
  };
  
  const handleActivateSafety = (action) => {
    toast.success(`${action} activated manually!`);
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
            <BsHouseDoor className="sidebar-icon" />
            <span>Home</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveSection('devices')}
          >
            <BsDisplay className="sidebar-icon" />
            <span>Devices</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'monitoring' ? 'active' : ''}`}
            onClick={() => setActiveSection('monitoring')}
          >
            <TbDeviceAnalytics className="sidebar-icon" />
            <span>Monitoring</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'energy' ? 'active' : ''}`}
            onClick={() => setActiveSection('energy')}
          >
            <MdOutlineEnergySavingsLeaf className="sidebar-icon" />
            <span>Energy</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'family' ? 'active' : ''}`}
            onClick={() => setActiveSection('family')}
          >
            <FaUsers className="sidebar-icon" />
            <span>Family</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveSection('alerts')}
          >
            <IoIosNotifications className="sidebar-icon" />
            <span>Alerts</span>
          </div>
        </div>
      </div>
      
      <div className="main-content">
        <div className="dashboard-header">
          <div className="user-info">
            <h1>Family Dashboard</h1>
            <p>Welcome, {currentUser?.displayName || currentUser?.email || 'Family Member'}</p>
          </div>
          <div className="header-actions">
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        
        <div className="dashboard-content">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="dashboard-section">
              <h2 className="section-title">Home Overview</h2>
              <div className="stat-cards">
                <div className="stat-card">
                  <h3>Devices</h3>
                  <p className="stat-number">{devices.length}</p>
                  <p className="stat-text">{devices.filter(d => d.status === 'on').length} devices active</p>
                </div>
                <div className="stat-card">
                  <h3>Family Members</h3>
                  <p className="stat-number">{familyMembers.length}</p>
                  <p className="stat-text">
                    {familyMembers.filter(m => m.status === 'active').length} members online
                  </p>
                </div>
                <div className="stat-card">
                  <h3>Alerts</h3>
                  <p className="stat-number">{alerts.length}</p>
                  <p className="stat-text">{alerts.filter(a => a.severity === 'medium' || a.severity === 'high').length} need attention</p>
                </div>
                <div className="stat-card">
                  <h3>Home Status</h3>
                  <p className="stat-number status-ok">Secure</p>
                  <p className="stat-text">All systems normal</p>
                </div>
              </div>
              
              <div className="overview-sections">
                <div className="recent-alerts">
                  <h3>Recent Alerts</h3>
                  <table className="data-table alerts-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Message</th>
                        <th>Time</th>
                        <th>Severity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.slice(0, 3).map(alert => (
                        <tr key={alert.id} className={`severity-${alert.severity}`}>
                          <td>{alert.type}</td>
                          <td>{alert.message}</td>
                          <td>{alert.timestamp}</td>
                          <td>
                            <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="recent-devices">
                  <h3>Recently Active Devices</h3>
                  <table className="data-table devices-table">
                    <thead>
                      <tr>
                        <th>Device</th>
                        <th>Status</th>
                        <th>Location</th>
                        <th>Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices.slice(0, 3).map(device => (
                        <tr key={device.id}>
                          <td>{device.name}</td>
                          <td>
                            <span className={`status-badge ${device.status}`}>
                              {device.status}
                            </span>
                          </td>
                          <td>{device.location}</td>
                          <td>{device.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="active-users">
                <h3>Active Family Members</h3>
                <table className="data-table users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Last Active</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {familyMembers.slice(0, 3).map((member, index) => (
                      <tr key={index}>
                        <td>
                          <div className="user-with-avatar">
                            <FaUserCircle className="avatar-icon" />
                            <span>{member.name || `Family Member ${index + 1}`}</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge active">Online</span>
                        </td>
                        <td>{member.lastActive}</td>
                        <td>{member.role === 'admin' ? 'Admin' : 'Family'}</td>
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
              <h2 className="section-title">Device Control</h2>
              <div className="device-controls">
                <div className="device-filters">
                  <select className="device-filter">
                    <option>All Rooms</option>
                    <option>Living Room</option>
                    <option>Kitchen</option>
                    <option>Bedroom</option>
                    <option>Family Room</option>
                  </select>
                  <select className="device-filter">
                    <option>All Types</option>
                    <option>Lights</option>
                    <option>Fans</option>
                    <option>Thermostats</option>
                  </select>
                </div>
              </div>
              
              <table className="data-table devices-control-table">
                <thead>
                  <tr>
                    <th>Device Name</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th>Energy Usage</th>
                    <th>Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(device => (
                    <tr key={device.id} className={!device.accessible ? 'restricted-row' : ''}>
                      <td>{device.name}</td>
                      <td>{device.type}</td>
                      <td>{device.location}</td>
                      <td>
                        <span className={`status-badge ${device.status}`}>
                          {device.status}
                        </span>
                      </td>
                      <td>{device.lastActive}</td>
                      <td>{device.energyUsage}</td>
                      <td>
                        {device.accessible ? (
                          <>
                            {['light', 'fan', 'thermostat'].includes(device.type) && (
                              <button 
                                className={`device-toggle-btn ${device.status === 'on' ? 'on' : 'off'}`}
                                onClick={() => handleToggleDevice(device.id)}
                              >
                                <IoIosSwitch className="toggle-icon" />
                                {device.status === 'on' ? 'Off' : 'On'}
                              </button>
                            )}
                            {device.type === 'thermostat' && device.status === 'on' && (
                              <div className="temp-controls">
                                <button className="temp-btn">-</button>
                                <span>{device.value}</span>
                                <button className="temp-btn">+</button>
                              </div>
                            )}
                          </>
                        ) : (
                          <button className="device-toggle-btn disabled" disabled>
                            {device.type === 'safety' && device.view === 'status-only' ? 'Status Only' : 'No Access'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Monitoring Section */}
          {activeSection === 'monitoring' && (
            <div className="dashboard-section">
              <h2 className="section-title">Device Monitoring</h2>
              
              <div className="appliance-status">
                <h3>Appliance Status</h3>
                <table className="data-table appliance-table">
                  <thead>
                    <tr>
                      <th>Appliance</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Last Used</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>TV</td>
                      <td><span className="status-badge off">Off</span></td>
                      <td>Living Room</td>
                      <td>3 hours ago</td>
                      <td>-</td>
                    </tr>
                    <tr>
                      <td>Refrigerator</td>
                      <td><span className="status-badge on">Running</span></td>
                      <td>Kitchen</td>
                      <td>Always On</td>
                      <td>Temperature: 4°C</td>
                    </tr>
                    <tr>
                      <td>Oven</td>
                      <td><span className="status-badge off">Off</span></td>
                      <td>Kitchen</td>
                      <td>Yesterday</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="activity-history">
                <h3>Recent Device Activity</h3>
                <table className="data-table activity-table">
                  <thead>
                    <tr>
                      <th>Device</th>
                      <th>Action</th>
                      <th>User</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getRecentActivities().map(activity => (
                      <tr key={activity.id}>
                        <td>{activity.device}</td>
                        <td>{activity.action}</td>
                        <td>{activity.user}</td>
                        <td>{activity.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="safety-controls">
                <h3>Safety Controls (Manual)</h3>
                <div className="safety-cards">
                  <div className="safety-card">
                    <h4>Ventilation System</h4>
                    <p>Use in case of gas detection or air quality issues</p>
                    <button className="safety-button" onClick={() => handleActivateSafety('Ventilation')}>
                      Activate Ventilation
                    </button>
                  </div>
                  <div className="safety-card">
                    <h4>Water Sprinkler</h4>
                    <p>Use in case of fire detection</p>
                    <button className="safety-button" onClick={() => handleActivateSafety('Water Sprinkler')}>
                      Activate Sprinkler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Energy Section */}
          {activeSection === 'energy' && (
            <div className="dashboard-section">
              <h2 className="section-title">Energy Monitoring</h2>
              
              <div className="energy-overview">
                <div className="energy-status">
                  <h3>Current Energy Usage</h3>
                  <div className="energy-meter">
                    <div className="energy-gauge">
                      <div className="gauge-value">405W</div>
                      <div className="gauge-label">Current Usage</div>
                    </div>
                  </div>
                </div>
                
                <div className="energy-devices">
                  <h3>Top Energy Consumers</h3>
                  <table className="data-table energy-table">
                    <thead>
                      <tr>
                        <th>Device Name</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Energy Usage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {devices
                        .filter(d => d.energyUsage)
                        .sort((a, b) => parseInt(b.energyUsage) - parseInt(a.energyUsage))
                        .slice(0, 4)
                        .map(device => (
                          <tr key={device.id}>
                            <td>{device.name}</td>
                            <td>{device.location}</td>
                            <td>
                              <span className={`status-badge ${device.status}`}>
                                {device.status}
                              </span>
                            </td>
                            <td>{device.energyUsage}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="energy-tips">
                <h3>Energy Saving Tips</h3>
                <table className="data-table tips-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Recommendation</th>
                      <th>Potential Saving</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Lighting</td>
                      <td>The kitchen lights have been on for 3 hours. Consider turning them off if not in use.</td>
                      <td>5W/hour</td>
                    </tr>
                    <tr>
                      <td>Temperature</td>
                      <td>Thermostat is set to 22°C while outdoor temperature is 20°C. Consider opening windows instead.</td>
                      <td>350W/hour</td>
                    </tr>
                    <tr>
                      <td>Standby Power</td>
                      <td>Multiple devices in standby mode detected. Unplugging them could save energy.</td>
                      <td>10W/hour</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Family Members Section - Already using a table */}
          {activeSection === 'family' && (
  <div className="dashboard-section">
    <h2 className="section-title">Family Members</h2>
    
    <div className="family-table-container">
      <table className="family-table">
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
          {familyMembers.length > 0 ? (
            familyMembers.map((member, index) => (
              <tr key={index}>
                <td>
                  <div className="user-with-avatar">
                    <FaUserCircle className="avatar-icon" />
                    <span>{member.name || `Family Member ${index + 1}`}</span>
                  </div>
                </td>
                <td>{member.email}</td>
                <td>
                  <span className={`role-badge ${member.role || 'family'}`}>
                    {member.role === 'admin' ? 'Admin' : member.role || 'Family'}
                  </span>
                </td>
                <td>{member.joinedDate}</td>
                <td>
                  <span className="status-badge active">Active</span>
                </td>
                <td>
                  <button className="action-btn">Edit</button>
                  <button className="action-btn remove">Remove</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="no-data">No family members found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
              
              <div className="user-profile">
                <h3>Your Profile</h3>
                <div className="profile-card">
                  <div className="profile-avatar">
                    <FaUserCircle className="avatar-icon large" />
                  </div>
                  <div className="profile-details">
                    <h4>{currentUser?.displayName || currentUser?.email || 'Family Member'}</h4>
                    <p>Role: Family Member</p>
                    <p>Email: {currentUser?.email}</p>
                    <p>Status: Online</p>
                  </div>
                  <div className="profile-actions">
                    <button className="profile-btn">Edit Profile</button>
                    <button className="profile-btn secondary">Change Theme</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Alerts Section */}
          {activeSection === 'alerts' && (
            <div className="dashboard-section">
              <h2 className="section-title">Alerts & Notifications</h2>
              <div className="alerts-controls">
                <div className="alert-filters">
                  <button className="filter-btn active">All</button>
                  <button className="filter-btn">Safety</button>
                  <button className="filter-btn">Devices</button>
                  <button className="filter-btn">System</button>
                </div>
              </div>
              
              <table className="data-table alerts-summary-table">
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
                      <td>
                        <span className={`alert-type-badge ${alert.type}`}>{alert.type}</span>
                      </td>
                      <td>{alert.message}</td>
                      <td>{alert.timestamp}</td>
                      <td>
                        <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
                      </td>
                      <td>
                        <button className="alert-btn">Acknowledge</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="notification-settings">
                <h3>Notification Preferences</h3>
                <table className="data-table settings-table">
                  <thead>
                    <tr>
                      <th>Notification Type</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Critical Safety Alerts</td>
                      <td>Get notifications for gas leaks, fire detection, motion in shared areas</td>
                      <td>
                        <label className="toggle-switch">
                          <input type="checkbox" checked onChange={() => {}} />
                          <span className="toggle-slider"></span>
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td>Device Status Updates</td>
                      <td>Get notified when shared devices change status</td>
                      <td>
                        <label className="toggle-switch">
                          <input type="checkbox" checked onChange={() => {}} />
                          <span className="toggle-slider"></span>
                        </label>
                      </td>
                    </tr>
                    <tr>
                      <td>Family Activity</td>
                      <td>Get notified when family members arrive or leave home</td>
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
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboard;