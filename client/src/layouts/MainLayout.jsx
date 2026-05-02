import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 transition-colors duration-500">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-8 px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
