// src/services/databaseService.js
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '../components/firebase';

// Home functions
export const createHome = async (homeData) => {
  const homeRef = collection(db, "homes");
  return await addDoc(homeRef, {
    ...homeData,
    createdAt: serverTimestamp()
  });
};

export const getHomeByAdminId = async (adminId) => {
  const homesRef = collection(db, "homes");
  const q = query(homesRef, where("adminId", "==", adminId), limit(1));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  const homeDoc = querySnapshot.docs[0];
  return {
    id: homeDoc.id,
    ...homeDoc.data()
  };
};

// Room functions
export const createRoom = async (homeId, roomData) => {
  const roomRef = collection(db, `homes/${homeId}/rooms`);
  return await addDoc(roomRef, {
    ...roomData,
    createdAt: serverTimestamp()
  });
};

export const getRooms = async (homeId) => {
  const roomsRef = collection(db, `homes/${homeId}/rooms`);
  const querySnapshot = await getDocs(roomsRef);
  
  const rooms = [];
  querySnapshot.forEach((doc) => {
    rooms.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return rooms;
};

// Device functions
export const createDevice = async (homeId, deviceData) => {
  const deviceRef = collection(db, `homes/${homeId}/devices`);
  return await addDoc(deviceRef, {
    ...deviceData,
    lastActive: serverTimestamp(),
    createdAt: serverTimestamp()
  });
};

export const getDevices = async (homeId) => {
  const devicesRef = collection(db, `homes/${homeId}/devices`);
  const querySnapshot = await getDocs(devicesRef);
  
  const devices = [];
  querySnapshot.forEach((doc) => {
    devices.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return devices;
};

export const getDevicesByRoom = async (homeId, roomId) => {
  const devicesRef = collection(db, `homes/${homeId}/devices`);
  const q = query(devicesRef, where("roomId", "==", roomId));
  const querySnapshot = await getDocs(q);
  
  const devices = [];
  querySnapshot.forEach((doc) => {
    devices.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return devices;
};

export const updateDeviceStatus = async (homeId, deviceId, status) => {
  const deviceRef = doc(db, `homes/${homeId}/devices/${deviceId}`);
  return await updateDoc(deviceRef, {
    status,
    lastActive: serverTimestamp()
  });
};

// Activity Log functions
export const addActivityLog = async (homeId, logData) => {
  const logRef = collection(db, `homes/${homeId}/activityLogs`);
  return await addDoc(logRef, {
    ...logData,
    timestamp: serverTimestamp()
  });
};

export const getActivityLogs = async (homeId, options = {}) => {
  const { type, limit: resultLimit = 50 } = options;
  
  const logsRef = collection(db, `homes/${homeId}/activityLogs`);
  let q = query(logsRef, orderBy("timestamp", "desc"), limit(resultLimit));
  
  if (type) {
    q = query(q, where("type", "==", type));
  }
  
  const querySnapshot = await getDocs(q);
  
  const logs = [];
  querySnapshot.forEach((doc) => {
    logs.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return logs;
};

// User Management functions
export const getHomeUsers = async (adminId) => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("adminId", "==", adminId));
  const querySnapshot = await getDocs(q);
  
  const users = [];
  querySnapshot.forEach((doc) => {
    users.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return users;
};

// Access Control functions
export const setUserAccess = async (homeId, userId, accessData) => {
  const accessRef = doc(db, `homes/${homeId}/accessControl/${userId}`);
  return await setDoc(accessRef, accessData);
};

export const getUserAccess = async (homeId, userId) => {
  const accessRef = doc(db, `homes/${homeId}/accessControl/${userId}`);
  const accessDoc = await getDoc(accessRef);
  
  if (!accessDoc.exists()) {
    return null;
  }
  
  return accessDoc.data();
};