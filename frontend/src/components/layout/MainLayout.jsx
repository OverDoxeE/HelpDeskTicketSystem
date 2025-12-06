import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <div>
      <Navbar />
      <main style={{ padding: '1rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
