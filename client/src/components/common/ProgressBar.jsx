/**
 * Generic reusable ProgressBar UI component.
 * Supports percentages, dynamic size variants, and animated fills.
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  size = 'md',
  showLabel = true,
  className = '',
  barClassName = '',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100))) || 0;

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const selectedHeight = heightClasses[size] || heightClasses.md;

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>Course Completion</span>
          <span className="text-indigo-400 font-extrabold">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden border border-white/5 ${selectedHeight}`}>
        <div
          className={`h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-500 rounded-full ${barClassName}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
