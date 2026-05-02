import { useState, useEffect } from "react";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  ArrowLeft,
  Search,
  MoreVertical,
  Calendar,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // For the modal dropdowns
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "todo",
    due_date: new Date().toISOString().split('T')[0],
    project_id: "",
    assigned_to: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    if (user?.role === 'admin') {
      try {
        const [projectsRes, usersRes] = await Promise.all([
          API.get("/projects"),
          API.get("/auth/users")
        ]);
        setProjects(projectsRes.data);
        setUsers(usersRes.data);
        if (projectsRes.data.length > 0) {
          setNewTask(prev => ({ ...prev, project_id: projectsRes.data[0].id }));
        }
        if (usersRes.data.length > 0) {
          setNewTask(prev => ({ ...prev, assigned_to: usersRes.data[0].id }));
        }
      } catch (err) {
        console.error("Error fetching form data", err);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (showModal) {
      fetchFormData();
    }
  }, [showModal]);

  const handleStatusUpdate = async (id, currentStatus) => {
    if (user?.role !== 'admin' && currentStatus !== 'done') {
        // Members might only be allowed to update their own tasks? We'll let them update any task status for now
    }
    const nextStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      await API.patch(`/tasks/${id}`, { status: nextStatus });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/tasks", newTask);
      setShowModal(false);
      setNewTask({
        title: "",
        description: "",
        status: "todo",
        due_date: new Date().toISOString().split('T')[0],
        project_id: projects.length > 0 ? projects[0].id : "",
        assigned_to: users.length > 0 ? users[0].id : ""
      });
      fetchData();
    } catch (err) {
      alert("Error creating task");
    } finally {
      setSubmitting(false);
    }
  };

  const days = [
    { day: "Mo", date: 3 },
    { day: "Tu", date: 4, active: true },
    { day: "We", date: 5 },
    { day: "Th", date: 6 },
    { day: "Fr", date: 7 },
    { day: "Sa", date: 8 },
    { day: "Su", date: 9 },
  ];

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 pt-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-10">
        <button
          onClick={() => navigate(-1)}
          className="p-3 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-100 shadow-sm"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <button className="p-3 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-100 shadow-sm">
          <Search size={20} className="text-slate-600" />
        </button>
      </header>

      {/* Date Selector Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Tasks</h1>
          {user?.role === 'admin' && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 py-2 px-6 rounded-full text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25"
            >
              <Plus size={16} />
              Add Task
            </button>
          )}
        </div>

        <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <span className="text-slate-400 font-bold text-sm">{d.day}</span>
              <button
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                  d.active
                    ? "bg-indigo-600 text-white shadow-lg scale-110 shadow-indigo-300"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {d.date}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Tasks List */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">All Tasks</h2>

        <div className="space-y-4">
          <AnimatePresence>
            {tasks.length > 0 ? (
              tasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm group"
                >
                  <button
                    onClick={() => handleStatusUpdate(task.id, task.status)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      task.status === 'done'
                        ? "bg-emerald-50 text-emerald-500 hover:bg-emerald-100"
                        : "bg-slate-50 text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Calendar size={20} />
                  </button>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className={`font-bold text-lg ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {task.title}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                        {task.project_name || "Unassigned Project"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      {task.description || 'No description provided'}
                    </p>
                    {task.assigned_to_name && (
                      <p className="text-xs text-indigo-500 font-medium mt-1">
                        Assigned to: {task.assigned_to_name}
                      </p>
                    )}
                  </div>

                  <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center text-slate-500 font-medium">
                No tasks available.
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white p-8 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Create a Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">Task Name</label>
                <input
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                  placeholder="e.g. Design Landing Page"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">Description</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all resize-none h-24"
                  placeholder="Task details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">Project</label>
                  <select
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                    value={newTask.project_id}
                    onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                  >
                    <option value="" disabled>Select Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">Assignee</label>
                  <select
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                    value={newTask.assigned_to}
                    onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  >
                    <option value="" disabled>Select User</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="date"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">Status</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : "Create Task"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
