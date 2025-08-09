interface ProgressBarProps {
  current: number;
  max: number;
  color: string;
  width?: string;
  height?: string;
}

const ProgressBar = ({ current, max, color, width = "100px", height = "8px" }: ProgressBarProps) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  return (
    <div 
      className="bg-gray-700 rounded-full overflow-hidden border border-gray-600"
      style={{ width, height }}
    >
      <div
        className={`h-full transition-all duration-300 ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
