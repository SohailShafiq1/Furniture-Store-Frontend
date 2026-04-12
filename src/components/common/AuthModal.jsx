import React, { useState } from 'react';
import axios from 'axios';
import { useUserAuth } from '../../context/UserAuthContext';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
    const { login } = useUserAuth();
    const [mode, setMode] = useState('login'); // login, signup, verify
    const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const apiBase = apiUrl + '/users';

    if (!isOpen) return null;

    const handleSwitch = (newMode) => {
        setMode(newMode);
        setError('');
        setMessage('');
    };

    const handleGoogleLogin = () => {
        window.location.href = `${apiUrl}/users/google`;
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const res = await axios.post(`${apiBase}/login`, { email: formData.email, password: formData.password });
                login(res.data.token, res.data.user);
                onClose();
            } else if (mode === 'signup') {
                const res = await axios.post(`${apiBase}/register`, { name: formData.name, email: formData.email, password: formData.password });
                setMessage(res.data.message);
                setMode('verify');
            } else if (mode === 'verify') {
                const res = await axios.post(`${apiBase}/verify-otp`, { email: formData.email, otp: formData.otp });
                login(res.data.token, res.data.user);
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-modal-overlay">
            <div className="auth-modal-container">
                <button className="auth-close-btn" onClick={onClose}>&times;</button>
                
                <div className="auth-logo">
                    <img src="/logo.svg" alt="Luna Furniture" className="auth-logo-img" />
                </div>

                <h3 className="auth-title">
                    {mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create Account' : 'Verify Email'}
                </h3>
                <p className="auth-subtitle">
                    {mode === 'login' ? 'Enter your details to access your account' : mode === 'signup' ? 'Join us and start shopping' : `OTP sent to ${formData.email}`}
                </p>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                {mode !== 'verify' && (
                    <>
                        <button className="google-auth-btn" onClick={handleGoogleLogin}>
                            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" width="20" alt="Google" />
                            Continue with Google
                        </button>
                        <div className="auth-divider">or</div>
                    </>
                )}

                <form onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                        <div className="auth-input-group">
                            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                        </div>
                    )}

                    {mode !== 'verify' && (
                        <>
                            <div className="auth-input-group">
                                <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                            </div>
                            <div className="auth-input-group">
                                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                            </div>
                        </>
                    )}

                    {mode === 'verify' && (
                        <div className="auth-input-group">
                            <input type="text" name="otp" placeholder="Enter 6-digit OTP" value={formData.otp} onChange={handleChange} maxLength="6" required style={{ textAlign: 'center', fontSize: '20px', letterSpacing: '8px' }} />
                        </div>
                    )}

                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : mode === 'login' ? 'Continue' : mode === 'signup' ? 'Sign Up' : 'Verify OTP'}
                    </button>
                </form>

                <div className="auth-switch-text">
                    {mode === 'login' ? (
                        <>Don't have an account? <span onClick={() => handleSwitch('signup')}>Create one</span></>
                    ) : (
                        <>Already have an account? <span onClick={() => handleSwitch('login')}>Sign in</span></>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;