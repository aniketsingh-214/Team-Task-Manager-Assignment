import React from 'react';

const FilterPill = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
        active
          ? "bg-white text-indigo-600 shadow-md scale-105"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
};

export default FilterPill;
