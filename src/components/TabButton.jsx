export default function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-1.5 rounded-md transition-colors text-sm ${
        active
          ? 'bg-blue-600 dark:bg-blue-500 text-white shadow'
          : 'text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-200 hover:bg-white/5 dark:hover:bg-white/10'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

