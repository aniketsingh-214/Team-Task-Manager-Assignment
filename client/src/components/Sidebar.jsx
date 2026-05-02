import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  LogOut,
  ShieldCheck,
  User,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Projects", path: "/projects", icon: <FolderKanban size={20} /> },
    { name: "My Tasks", path: "/tasks", icon: <CheckSquare size={20} /> },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen shadow-sm z-20">
      <div className="p-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200">
          <CheckSquare className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
          TaskFlow
        </h1>
      </div>

      <nav className="flex-1 px-6 py-4 space-y-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => `
              flex items-center gap-4 px-5 py-4 rounded-[1.25rem] transition-all duration-300 group
              ${isActive
                ? "bg-indigo-50 text-indigo-600 font-bold shadow-sm border border-indigo-100"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  {item.icon}
                </div>
                <span className="text-sm tracking-wide">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-5 flex flex-col gap-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-indigo-50 flex items-center justify-center">
              {user?.role === 'admin' ? (
                <Shield size={24} className="text-indigo-500" />
              ) : (
                <User size={24} className="text-indigo-500" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                <ShieldCheck size={10} className="text-indigo-500" />
                {user?.role}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white text-red-500 border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all text-xs font-bold shadow-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
