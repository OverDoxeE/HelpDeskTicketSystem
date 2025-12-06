import React from 'react';

function LoginForm({ onSubmit }) {
  // ...basic form structure...
  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>Email:</label>
        <input type="email" name="email" required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password" required />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

export default LoginForm;
