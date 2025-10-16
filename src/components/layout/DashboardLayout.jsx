import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar'; // We will create this next

export const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* The Sidebar is fixed and always visible */}
      <Sidebar />
      
      {/* Main content area */}
      {/* It has a left margin to not be hidden behind the sidebar */}
      <main className="flex-1 ml-[260px]">
        {/* A placeholder for a future Header component */}
        {/* <Header /> */}
        
        {/* The Outlet renders the current route's component */}
        <div >
          <Outlet />
        </div>
      </main>
    </div>
  );
};