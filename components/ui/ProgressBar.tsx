'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  height?: 'small' | 'medium' | 'large';
}

export default function ProgressBar({
  value,
  max = 100,
  color = '#ff6b9d',
  showLabel = true,
  height = 'medium'
}: ProgressBarProps) {
  const heightClasses = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };

  const percentage = (value / max) * 100;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
          <span>0%</span>
          <span className="font-medium">{value}%</span>
          <span>{max}%</span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <motion.div
          className="rounded-full transition-all duration-1000"
          style={{ backgroundColor: color, width: `${percentage}%`, height: '100%' }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}