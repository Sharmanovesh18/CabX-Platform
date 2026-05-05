import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, ShieldCheck, Github, Chrome } from 'lucide-react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'User' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleRoleSelect = (role) => setForm({ ...form, role });

  const saveUser = (user, token) => {
    const currentUser = { ...user, token };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    window.dispatchEvent(new Event('auth-changed'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await axios.post('http://localhost:5001/api/auth/register', {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: form.role,
        });
        if (res.data && res.data.user) {
          saveUser(res.data.user, res.data.token);
          onClose();
        } else {
          setError(res.data?.message || 'Registration failed');
        }
      } else {
        const res = await axios.post('http://localhost:5001/api/auth/login', {
          email: form.email,
          password: form.password,
        });
        if (res.data && res.data.token) {
          saveUser(res.data.user, res.data.token);
          onClose();
        } else {
          setError(res.data?.message || 'Login failed');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    initial: { x: mode === 'login' ? -20 : 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: mode === 'login' ? 20 : -20, opacity: 0 }
  };

  return createPortal(
    <div className="auth-modal-overlay" onClick={onClose}>
      <motion.div 
        className="auth-modal" 
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      >
        <button className="auth-close" onClick={onClose} aria-label="Close modal"><X size={20} /></button>
        
        <div className="auth-header">
          <div className="auth-logo">
            <ShieldCheck size={32} className="secure-icon" />
          </div>
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{mode === 'login' ? 'Sign in to access your rides and rewards' : 'Join Saarthi for safe and affordable travel'}</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={mode === 'login' ? 'active' : ''} 
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button 
            className={mode === 'register' ? 'active' : ''} 
            onClick={() => setMode('register')}
          >
            Sign Up
          </button>
          <div className={`tab-slider ${mode}`}></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.form 
            key={mode}
            className="auth-form" 
            onSubmit={handleSubmit}
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {mode === 'register' && (
              <div className="role-selector-container">
                <label className="role-label">I am signing up as:</label>
                <div className="role-cards">
                  <div 
                    className={`role-card ${form.role === 'User' ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect('User')}
                  >
                    <User size={24} />
                    <span>User</span>
                  </div>
                  <div 
                    className={`role-card ${form.role === 'Admin' ? 'selected' : ''}`}
                    onClick={() => handleRoleSelect('Admin')}
                  >
                    <ShieldCheck size={24} />
                    <span>Admin</span>
                  </div>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div className="auth-input-group">
                <User size={18} />
                <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required />
              </div>
            )}
            {mode === 'register' && (
              <div className="auth-input-group">
                <Phone size={18} />
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" required />
              </div>
            )}
            <div className="auth-input-group">
              <Mail size={18} />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email address" type="email" required />
            </div>
            <div className="auth-input-group">
              <Lock size={18} />
              <input 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="Password" 
                type={showPassword ? "text" : "password"} 
                required 
              />
              <button 
                type="button" 
                className="eye-toggle" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Get Started'}
            </button>
          </motion.form>
        </AnimatePresence>

        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <div className="social-auth">
          <button className="social-btn"><Chrome size={18} /> Google</button>
          <button className="social-btn"><Github size={18} /> GitHub</button>
        </div>

        <div className="auth-footer">
          {mode === 'login' ? (
            <p>Don't have an account? <span onClick={() => setMode('register')}>Sign Up</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => setMode('login')}>Log In</span></p>
          )}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
export default AuthModal;
