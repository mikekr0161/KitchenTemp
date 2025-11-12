import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-xl font-bold">KitchenControl Pro</h1>
        </div>
        <nav className="mt-4">
          <a href="#" className="block p-4 text-gray-700 hover:bg-gray-200">Dashboard</a>
          <a href="#" className="block p-4 text-gray-700 hover:bg-gray-200">Food Hygiene</a>
          <a href="#" className="block p-4 text-gray-700 hover:bg-gray-200">Inventory</a>
          <a href="#" className="block p-4 text-gray-700 hover:bg-gray-200">Menu & Allergens</a>
          <a href="#" className="block p-4 text-gray-700 hover:bg-gray-200">Shifts & Rotas</a>
          <a href="#" className="block p-4 text-gray-700 hover:bg-gray-200">Learning</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex justify-between items-center p-4 bg-white border-b">
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div>
            <span>User Profile</span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
