import React from 'react';
import UserPanel from '../components/user/UserPanel';

function UserPanelPage() {
  const user = null;
  return (
    <div>
      <h2>User Panel</h2>
      <UserPanel user={user} onEdit={() => {}} />
    </div>
  );
}

export default UserPanelPage;
