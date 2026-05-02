import { useState, useEffect } from "react";
import API from "../api/api";
import {
  Search,
  Menu,
  Bell,
  LayoutGrid,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Target,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import FilterPill from "../components/FilterPill";
import { ProjectCard, TaskListItem } from "../components/DashboardComponents";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0, overdue: 0, todo: 0, in_progress: 0 });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("My Tasks");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Initial fetch for projects and users (Admin only)
  useEffect(() => {
    const fetchAdminData = async () => {
      if (user?.role === 'admin') {
        try {
          const [projectsRes, usersRes] = await Promise.all([
            API.get("/projects"),
            API.get("/auth/users")
          ]);
          setProjects(projectsRes.data);
          setUsers(usersRes.data);
        } catch (err) {
          console.error("Failed to fetch admin data", err);
        }
      }
    };
    fetchAdminData();
  }, [user]);

  // Fetch tasks and stats whenever user changes or selected user filter changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        let statsUrl = "/tasks/stats";
        let tasksUrl = "/tasks";
        
        if (selectedUserId) {
          statsUrl += `?user_id=${selectedUserId}`;
          tasksUrl += `?user_id=${selectedUserId}`;
        }

        const [statsRes, tasksRes] = await Promise.all([
          API.get(statsUrl),
          API.get(tasksUrl)
        ]);
        
        setStats(statsRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, selectedUserId]);

  if (loading && tasks.length === 0) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  const gradients = [
    "bg-gradient-to-br from-indigo-500 to-purple-600",
    "bg-gradient-to-br from-blue-500 to-indigo-600",
    "bg-gradient-to-br from-purple-500 to-pink-600"
  ];

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === "My Tasks") return true;
    if (activeFilter === "In-progress") return task.status === "in-progress";
    if (activeFilter === "Completed") return task.status === "done";
    return true;
  });

  const getPercentage = (val) => stats.total > 0 ? Math.round((val / stats.total) * 100) : 0;
  const todoPct = getPercentage(stats.todo);
  const inProgressPct = getPercentage(stats.in_progress);
  const donePct = getPercentage(stats.completed);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 pt-4">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between mb-8">
        <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <Menu size={24} className="text-slate-600" />
        </button>
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <Bell size={24} className="text-slate-600" />
            {stats.overdue > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-md">
            <div className="w-full h-full rounded-full border-2 border-white bg-white/20 flex items-center justify-center backdrop-blur-sm">
              {user?.role === 'admin' ? (
                <Shield size={18} className="text-white" />
              ) : (
                <User size={18} className="text-white" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Greeting Section */}
      <section className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Hello {user?.name || "User"}!</h1>
        <p className="text-slate-400 font-medium mt-1 text-lg">
          {user?.role === 'admin' ? "Here is your team's overview." : "Here is your personal progress."}
        </p>
      </section>

      {/* Admin View: Projects */}
      {user?.role === 'admin' && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Projects</h2>
          {projects.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4">
              {projects.slice(0, 5).map((project, index) => (
                <ProjectCard
                  key={project.id}
                  title={project.name}
                  date={new Date(project.created_at).toLocaleDateString()}
                  gradient={gradients[index % gradients.length]}
                  delay={0.1 * index}
                />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center text-slate-500">
              No projects available yet.
            </div>
          )}
        </section>
      )}

      {/* Progress Dashboard (For Both Admin and Member) */}
      <section className="mb-12">
        {user?.role === 'admin' && (
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedUserId ? "User Progress" : "Overall Team Progress"}
            </h2>
            <select
              className="bg-white border border-slate-200 rounded-xl py-2 px-4 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200 font-medium shadow-sm min-w-[200px]"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">All Team Members</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          )}
          
          {/* Circular Progress Ring */}
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              {/* Background Track */}
              <path
                className="text-slate-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Completed (Emerald) */}
              {donePct > 0 && (
                <motion.path
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${donePct}, 100` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="text-emerald-500"
                  strokeWidth="3"
                  strokeDasharray={`${donePct}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              )}
              {/* In Progress (Indigo) - Offset by Completed */}
              {inProgressPct > 0 && (
                <motion.path
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${inProgressPct}, 100` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="text-indigo-500"
                  strokeWidth="3"
                  strokeDasharray={`${inProgressPct}, 100`}
                  strokeDashoffset={`-${donePct}`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Target className="text-indigo-500 mb-1" size={24} />
              <span className="text-2xl font-bold text-slate-800 leading-none">{stats.total}</span>
              <span className="text-xs text-slate-400 font-bold mt-1">TASKS</span>
            </div>
          </div>

          {/* Progress Legend & Line Bars */}
          <div className="flex-1 w-full space-y-5">
            
            <div>
              <div className="flex justify-between text-sm mb-2 font-bold">
                <span className="text-slate-500 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> To Do
                </span>
                <span className="text-slate-800">{todoPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${todoPct}%` }} transition={{ duration: 1 }} className="h-full bg-slate-300 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2 font-bold">
                <span className="text-slate-500 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> In Progress
                </span>
                <span className="text-slate-800">{inProgressPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${inProgressPct}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-indigo-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2 font-bold">
                <span className="text-slate-500 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
                </span>
                <span className="text-slate-800">{donePct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${donePct}%` }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Category Filters */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 mt-4">
        {["My Tasks", "In-progress", "Completed"].map((filter) => (
          <FilterPill
            key={filter}
            label={filter}
            active={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
          />
        ))}
      </div>

      {/* Tasks Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">
            {user?.role === 'admin' 
              ? (selectedUserId ? "User's Assigned Tasks" : "Recent Team Tasks") 
              : "Your Assigned Tasks"}
          </h2>
        </div>

        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.slice(0, 10).map((task, index) => (
              <TaskListItem
                key={task.id}
                title={task.title}
                subtitle={task.project_name || "No Project"}
                icon={task.status === 'done' ? CheckCircle2 : (task.status === 'in-progress' ? Clock : LayoutGrid)}
                delay={0.1 * index}
              />
            ))
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center text-slate-500">
              No tasks match the current filter.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
