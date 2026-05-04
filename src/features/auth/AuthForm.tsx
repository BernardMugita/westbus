import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './authStore';
import { authService } from './authService';
import type { UserCreate, UserLogin, UserResponse } from '../../types/auth';
import './AuthForm.scss';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    full_name: '',
    phone_number: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const loginData: UserLogin = {
          username: formData.username,
          password: formData.password,
        };
        const response = await authService.login(loginData);
        if (response.status === 'success' && typeof response.payload === 'string') {
          // In a real app, you'd probably get the user object too or fetch it with the token
          // For now, I'll mock the user object if it's not provided in the payload
          const mockUser: UserResponse = {
            username: formData.username,
            email: '', // Backend should ideally return this
            full_name: formData.username,
            phone_number: null,
          };
          setAuth(mockUser, response.payload);
          navigate('/');
        } else {
          setError(response.message);
        }
      } else {
        const registerData: UserCreate = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          full_name: formData.full_name,
          phone_number: formData.phone_number || undefined,
        };
        const response = await authService.register(registerData);
        if (response.status === 'success') {
          setIsLogin(true);
          setError(null);
          alert('Registration successful! Please login.');
        } else {
          setError(response.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <header className="auth-header">
          <div className="auth-header__logo">
            <span>W</span>
          </div>
          <h1 className="auth-header__title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="auth-header__sub">
            {isLogin 
              ? 'Enter your credentials to access your dashboard' 
              : 'Join WestBus and start managing your fleet today'}
          </p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-form__error">{error}</div>}

          {!isLogin && (
            <div className="auth-form__group">
              <label className="auth-form__label">Full Name</label>
              <input
                type="text"
                name="full_name"
                className="auth-form__input"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleInputChange}
                required={!isLogin}
              />
            </div>
          )}

          <div className="auth-form__group">
            <label className="auth-form__label">Username</label>
            <input
              type="text"
              name="username"
              className="auth-form__input"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="auth-form__group">
              <label className="auth-form__label">Email Address</label>
              <input
                type="email"
                name="email"
                className="auth-form__input"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required={!isLogin}
              />
            </div>
          )}

          <div className="auth-form__group">
            <label className="auth-form__label">Password</label>
            <input
              type="password"
              name="password"
              className="auth-form__input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {!isLogin && (
            <div className="auth-form__group">
              <label className="auth-form__label">Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone_number"
                className="auth-form__input"
                placeholder="+254 700 000 000"
                value={formData.phone_number}
                onChange={handleInputChange}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn--primary auth-form__submit"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>

          <div className="auth-form__footer">
            {isLogin ? (
              <>
                Don't have an account? 
                <button type="button" onClick={() => setIsLogin(false)}>Sign Up</button>
              </>
            ) : (
              <>
                Already have an account? 
                <button type="button" onClick={() => setIsLogin(true)}>Sign In</button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
