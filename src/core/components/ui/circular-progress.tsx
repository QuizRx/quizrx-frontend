export default function CircularProgress({ percentage = 0, strokeColor = "#3b82f6", textColor = "#3b82f6" }) {
  const progress = Math.min(100, Math.max(0, percentage));
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <div className="relative w-12 h-12">
      <svg className="w-full h-full transform" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke="#e6e6e6"
          strokeWidth="4"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[12px] font-medium" style={{ color: textColor }}>
        {percentage}%
      </div>
    </div>
  );
}
