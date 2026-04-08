import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserAuth } from '../context/UserAuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfileSettingsPage.css';

const ProfileSettingsPage = () => {
  const { user, token, logout, login } = useUserAuth();
  const navigate = useNavigate();

  // Profile Edit State
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const apiEndpoint = `${apiUrl}/users`;

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [token, user, navigate]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!profileData.name.trim()) {
      setProfileError('Name is required');
      return;
    }

    if (!profileData.email.trim()) {
      setProfileError('Email is required');
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileMessage('');

      const response = await axios.put(
        `${apiEndpoint}/profile`,
        {
          name: profileData.name,
          email: profileData.email
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update context with new user data
      login(token, response.data.user);
      setProfileMessage('Profile updated successfully!');
      setIsEditingProfile(false);
      
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError('New password is required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordMessage('');

      await axios.put(
        `${apiEndpoint}/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setPasswordMessage('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsEditingPassword(false);
      
      setTimeout(() => setPasswordMessage(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/');
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="profile-settings-page">
      {/* Header */}
      <div className="profile-header">
        <div className="header-content">
          <h1>Profile Settings</h1>
          <p className="header-subtitle">Manage your account information</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="profile-container">
        <div className="profile-grid">
          
          {/* Left Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-avatar-section">
              <div className="avatar-circle">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2>{user?.name}</h2>
              <p className="email-text">{user?.email}</p>
              <div className="account-status">
                <span className="status-badge verified">
                  <span className="status-dot"></span>
                  Verified Account
                </span>
              </div>
            </div>

            <div className="sidebar-menu">
              <a href="#profile" className="menu-item active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile
              </a>
              <a href="#security" className="menu-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                Security
              </a>
              <a href="#account" className="menu-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                Account
              </a>
            </div>

            <button className="logout-button" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sign Out
            </button>
          </div>

          {/* Right Content */}
          <div className="profile-content">
            
            {/* Profile Section */}
            <div className="content-section" id="profile">
              <div className="section-header">
                <h3>Personal Information</h3>
                {!isEditingProfile && (
                  <button 
                    className="edit-button"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {profileMessage && <div className="success-message">{profileMessage}</div>}
              {profileError && <div className="error-message">{profileError}</div>}

              {isEditingProfile ? (
                <form onSubmit={handleProfileUpdate} className="profile-form">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="btn-primary"
                      disabled={profileLoading}
                    >
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileData({
                          name: user?.name || '',
                          email: user?.email || ''
                        });
                        setProfileError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info-display">
                  <div className="info-field">
                    <label>Full Name</label>
                    <p>{profileData.name || 'Not provided'}</p>
                  </div>
                  <div className="info-field">
                    <label>Email Address</label>
                    <p>{profileData.email || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Security Section */}
            {user?.email && !user?.googleId && (
              <div className="content-section" id="security">
                <div className="section-header">
                  <h3>Security</h3>
                  {!isEditingPassword && (
                    <button 
                      className="edit-button"
                      onClick={() => setIsEditingPassword(true)}
                    >
                      Change Password
                    </button>
                  )}
                </div>

                {passwordMessage && <div className="success-message">{passwordMessage}</div>}
                {passwordError && <div className="error-message">{passwordError}</div>}

                {isEditingPassword ? (
                  <form onSubmit={handlePasswordChange} className="profile-form">
                    <div className="form-group">
                      <label htmlFor="current-password">Current Password</label>
                      <div className="password-input-wrapper">
                        <input
                          id="current-password"
                          type={showPassword.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('current')}
                        >
                          {showPassword.current ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="new-password">New Password</label>
                      <div className="password-input-wrapper">
                        <input
                          id="new-password"
                          type={showPassword.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Enter new password (min 6 characters)"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPassword.new ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirm-password">Confirm New Password</label>
                      <div className="password-input-wrapper">
                        <input
                          id="confirm-password"
                          type={showPassword.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {showPassword.confirm ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? 'Updating...' : 'Update Password'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setIsEditingPassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          });
                          setPasswordError('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="password-display">
                    <div className="info-field">
                      <label>Password</label>
                      <p>••••••••••••</p>
                    </div>
                    <p className="help-text">
                      To change your password, click the "Change Password" button above.
                    </p>
                  </div>
                )}
              </div>
            )}

            {user?.googleId && (
              <div className="content-section info-box">
                <h4>Authentication Method</h4>
                <p>You're using Google Sign-In to access your account. Password changes are managed through your Google account.</p>
              </div>
            )}

            {/* Account Section */}
            <div className="content-section" id="account">
              <h3>Account Information</h3>
              <div className="account-info">
                <div className="info-item">
                  <div className="info-item-left">
                    <h4>Member Since</h4>
                    <p className="help-text">
                      {user?.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Not available'
                      }
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-item-left">
                    <h4>Account Status</h4>
                    <p className="help-text">
                      {user?.isVerified ? (
                        <span className="badge verified">✓ Verified</span>
                      ) : (
                        <span className="badge unverified">⏱ Pending Verification</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-item-left">
                    <h4>Authentication</h4>
                    <p className="help-text">
                      {user?.googleId ? 'Google Sign-In' : 'Email & Password'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
