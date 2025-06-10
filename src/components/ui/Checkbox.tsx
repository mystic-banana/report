import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  className?: string;
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLDivElement, CheckboxProps>(
  ({ className = "", checked = false, disabled = false, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(checked);
    
    const handleClick = () => {
      if (disabled) return;
      
      const newChecked = !isChecked;
      setIsChecked(newChecked);
      onCheckedChange?.(newChecked);
    };
    
    // Use controlled component pattern if checked prop is provided
    const checkedState = checked !== undefined ? checked : isChecked;
    
    return (
      <div
        ref={ref}
        role="checkbox"
        aria-checked={checkedState}
        tabIndex={disabled ? -1 : 0}
        className={`
          relative h-4 w-4 shrink-0 rounded-sm border border-dark-600 
          ${checkedState ? "bg-amber-500" : "bg-transparent"} 
          ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} 
          focus:outline-none focus:ring-1 focus:ring-amber-500 
          ${className}
        `}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        {...props}
      >
        {checkedState && (
          <div className="flex items-center justify-center h-full w-full text-white">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
