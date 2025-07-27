// src/contexts/HomeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { getActivityLogs, getDevices, getHomeByAdminId, getHomeUsers, getRooms } from '../services/databaseService';

const HomeContext = createContext();

export const useHome = () => {
  return useContext(HomeContext);
};

export const HomeProvider = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [home, setHome] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [devices, setDevices] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHomeData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Get user document to get adminId
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          setError("User profile not found");
          setLoading(false);
          return;
        }
        
        const userData = userDoc.data();
        const adminId = userData.adminId;
        
        // Get home data
        const homeData = await getHomeByAdminId(adminId);
        if (!homeData) {
          // For admin users, they might not have created a home yet
          if (userRole === 'admin') {
            setHome(null);
            setLoading(false);
            return;
          } else {
            setError("No home found for this user");
            setLoading(false);
            return;
          }
        }
        
        setHome(homeData);
        
        // Load rooms, devices, and activity logs
        const [roomsData, devicesData, logsData, usersData] = await Promise.all([
          getRooms(homeData.id),
          getDevices(homeData.id),
          getActivityLogs(homeData.id, { limit: 20 }),
          getHomeUsers(adminId)
        ]);
        
        setRooms(roomsData);
        setDevices(devicesData);
        setActivityLogs(logsData);
        setUsers(usersData);
      } catch (err) {
        console.error("Error loading home data:", err);
        setError("Failed to load home data");
      } finally {
        setLoading(false);
      }
    };
    
    loadHomeData();
  }, [currentUser, userRole]);

  // Create a function to refresh the data
  const refreshHomeData = async () => {
    if (!home) return;
    
    try {
      setLoading(true);
      
      // Load rooms, devices, and activity logs
      const [roomsData, devicesData, logsData, usersData] = await Promise.all([
        getRooms(home.id),
        getDevices(home.id),
        getActivityLogs(home.id, { limit: 20 }),
        getHomeUsers(home.adminId)
      ]);
      
      setRooms(roomsData);
      setDevices(devicesData);
      setActivityLogs(logsData);
      setUsers(usersData);
    } catch (err) {
      console.error("Error refreshing home data:", err);
      setError("Failed to refresh home data");
    } finally {
      setLoading(false);
    }
  };

  // Function to update a device status
  const updateDevice = async (deviceId, status) => {
    if (!home) return;
    
    try {
      await updateDeviceStatus(home.id, deviceId, status);
      
      // Update local state
      setDevices(prevDevices => 
        prevDevices.map(device => 
          device.id === deviceId 
            ? { ...device, status, lastActive: new Date().toISOString() } 
            : device
        )
      );
      
      // Log the activity
      await addActivityLog(home.id, {
        type: 'device',
        message: `${currentUser.displayName || currentUser.email} changed ${
          devices.find(d => d.id === deviceId)?.name || 'a device'
        } status to ${status}`,
        userId: currentUser.uid,
        deviceId,
        severity: 'low'
      });
      
      // Refresh activity logs
      const logsData = await getActivityLogs(home.id, { limit: 20 });
      setActivityLogs(logsData);
      
      return true;
    } catch (err) {
      console.error("Error updating device:", err);
      return false;
    }
  };

  const value = {
    home,
    rooms,
    devices,
    activityLogs,
    users,
    loading,
    error,
    refreshHomeData,
    updateDevice
  };

  return (
    <HomeContext.Provider value={value}>
      {children}
    </HomeContext.Provider>
  );
};