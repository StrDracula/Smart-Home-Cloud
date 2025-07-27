// src/components/ui/DeviceCard.jsx
import React from 'react';
import { IoIosSwitch } from 'react-icons/io';
import { MdSettings } from 'react-icons/md';
import { useHome } from '../../contexts/HomeContext';
import '../../styles/DeviceCard.css';

const DeviceCard = ({ device, showControls = true, onSettings }) => {
  const { updateDevice } = useHome();

  const handleToggle = async () => {
    const newStatus = device.status === 'on' ? 'off' : 'on';
    await updateDevice(device.id, newStatus);
  };

  // Get appropriate icon based on device type
  const getDeviceIcon = () => {
    switch (device.type.toLowerCase()) {
      case 'light':
        return '💡';
      case 'thermostat':
        return '🌡️';
      case 'lock':
        return '🔒';
      case 'camera':
        return '📹';
      case 'door':
        return '🚪';
      case 'climate':
        return '❄️';
      default:
        return '📱';
    }
  };

  return (
    <div className="device-card">
      <div className="device-header">
        <div className="device-icon-name">
          <span className="device-icon">{getDeviceIcon()}</span>
          <h3 className="device-name">{device.name}</h3>
        </div>
        <span className={`device-status-indicator ${device.status === 'on' ? 'online' : 'offline'}`}></span>
      </div>
      <div className="device-body">
        <p className="device-type">Type: {device.type}</p>
        {device.value && <p className="device-value">Value: {device.value}</p>}
        <p className="device-last-seen">Last active: {device.lastActive}</p>
        {device.roomName && <p className="device-room">Room: {device.roomName}</p>}
      </div>
      {showControls && (
        <div className="device-actions">
          <button 
            className={`device-toggle-btn ${device.status === 'on' ? 'on' : 'off'}`}
            onClick={handleToggle}
          >
            <IoIosSwitch className="toggle-icon" />
            {device.status === 'on' ? 'Turn Off' : 'Turn On'}
          </button>
          {onSettings && (
            <button 
              className="device-settings-btn"
              onClick={() => onSettings(device)}
            >
              <MdSettings className="settings-icon" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DeviceCard;