import React, { useState } from 'react';
import { FaUserAlt, FaUserShield, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('signup'); // 'signup' or 'signin'

  const handleRoleSelect = (role) => {
    navigate(`/${authMode}/${role}`);
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
  };

  return (
    <div className="role-selection-container">
      <h1>{authMode === 'signup' ? 'Sign Up' : 'Sign In'} as</h1>
      <div className="roles-container">
        <div className="role-card" onClick={() => handleRoleSelect('admin')}>
          <FaUserShield className="role-icon" />
          <h3>Admin</h3>
          <p>Full control and management access</p>
        </div>

        <div className="role-card" onClick={() => handleRoleSelect('family')}>
          <FaUsers className="role-icon" />
          <h3>Family</h3>
          <p>Access for household members</p>
        </div>

        <div className="role-card" onClick={() => handleRoleSelect('guest')}>
          <FaUserAlt className="role-icon" />
          <h3>Guest</h3>
          <p>Limited access for visitors</p>
        </div>
      </div>
      
      <div className="auth-toggle">
        <p>
          {authMode === 'signup' 
            ? 'Already have an account? ' 
            : 'Don\'t have an account? '}
          <span className="toggle-link" onClick={toggleAuthMode}>
            {authMode === 'signup' ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;