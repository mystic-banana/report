import React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  className?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className = "", value = 0, max = 100, ...props }, ref) => {
    // Ensure value is between 0 and max
    const percentage = Math.min(Math.max(0, value), max) / max * 100;

    return (
      <div
        className={`relative h-2 w-full overflow-hidden rounded-full bg-dark-700 ${className}`}
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        {...props}
      >
        <div
          className="h-full w-full flex-1 bg-gradient-to-r from-amber-500 to-amber-400 transition-all"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
