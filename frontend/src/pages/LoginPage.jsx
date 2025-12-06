import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSuccess = ({ email }) => {
    login({ email });
    navigate('/tickets');
  };

  return (
    <div>
      <h2>Login</h2>
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

export default LoginPage;
