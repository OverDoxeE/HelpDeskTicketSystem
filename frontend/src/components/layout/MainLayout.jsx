import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import FlashMessage from "./FlashMessage";

function MainLayout() {
  return (
    <>
      <Navbar />
      <main style={{ padding: "20px" }}>
        <FlashMessage />
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;
