import { Outlet } from "react-router-dom";
import { Sidebar, Header, DashboardContent } from "../components";

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard;
