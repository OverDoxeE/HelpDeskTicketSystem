import React from 'react';

function UserPanel({ user, onEdit }) {
  if (!user) return <div>Loading user...</div>;
  return (
    <div>
      <h3>User Panel</h3>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
}

export default UserPanel;
