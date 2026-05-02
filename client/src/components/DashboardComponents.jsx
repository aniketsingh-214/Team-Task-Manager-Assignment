import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Calendar } from 'lucide-react';

export const ProjectCard = ({ title, date, gradient, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`min-w-[240px] p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group cursor-pointer ${gradient}`}
    >
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
        <Calendar size={80} />
      </div>

      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
          <Calendar size={20} />
        </div>
        <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Project</p>
        <h3 className="text-xl font-bold mb-4 leading-tight">{title}</h3>
        <p className="text-white/80 text-sm font-medium">{date}</p>
      </div>
    </motion.div>
  );
};

export const TaskListItem = ({ title, subtitle, icon: Icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all group cursor-pointer shadow-sm hover:shadow-md"
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
        <Icon size={20} className="text-slate-400 group-hover:text-indigo-500" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
      </div>
      <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
        <MoreVertical size={20} />
      </button>
    </motion.div>
  );
};
