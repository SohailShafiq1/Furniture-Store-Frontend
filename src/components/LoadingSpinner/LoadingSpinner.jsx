import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = true }) => {
  return (
    <div className={`loading-spinner-overlay ${fullScreen ? 'full-screen' : 'inline'}`}>
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className="spinner-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
