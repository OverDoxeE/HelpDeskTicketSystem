import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async ({ email, password }) => {
    try {
      await login(email, password);
      setError('');
      navigate('/tickets');
    } catch (e) {
      setError('Login failed');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <LoginForm onSubmit={handleSubmit} />
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default LoginPage;
