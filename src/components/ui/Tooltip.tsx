import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
}

interface TooltipContentProps {
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  className?: string;
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

const TooltipContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenChange: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
  onOpenChange: () => {},
});

export function Tooltip({ children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  
  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
  };
  
  return (
    <TooltipContext.Provider value={{ open, setOpen, onOpenChange }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({ children, asChild = false }: TooltipTriggerProps) {
  const { setOpen } = React.useContext(TooltipContext);
  
  const childElement = asChild ? (
    React.Children.only(children)
  ) : (
    <span>{children}</span>
  );
  
  return React.cloneElement(
    childElement as React.ReactElement,
    {
      onMouseEnter: () => setOpen(true),
      onMouseLeave: () => setOpen(false),
      onFocus: () => setOpen(true),
      onBlur: () => setOpen(false),
    }
  );
}

export function TooltipContent({ 
  children, 
  side = 'top', 
  align = 'center', 
  className = '' 
}: TooltipContentProps) {
  const { open } = React.useContext(TooltipContext);
  
  if (!open) return null;
  
  // Position classes based on side and alignment
  const positionClasses = {
    top: {
      start: 'bottom-full left-0 mb-1',
      center: 'bottom-full left-1/2 -translate-x-1/2 mb-1',
      end: 'bottom-full right-0 mb-1',
    },
    right: {
      start: 'left-full top-0 ml-1',
      center: 'left-full top-1/2 -translate-y-1/2 ml-1',
      end: 'left-full bottom-0 ml-1',
    },
    bottom: {
      start: 'top-full left-0 mt-1',
      center: 'top-full left-1/2 -translate-x-1/2 mt-1',
      end: 'top-full right-0 mt-1',
    },
    left: {
      start: 'right-full top-0 mr-1',
      center: 'right-full top-1/2 -translate-y-1/2 mr-1',
      end: 'right-full bottom-0 mr-1',
    },
  };
  
  return (
    <div 
      className={`absolute z-50 whitespace-nowrap rounded px-2 py-1 text-xs bg-dark-800 text-white border border-dark-700 animate-fade-in ${positionClasses[side][align]} ${className}`}
      role="tooltip"
    >
      {children}
      <div className="tooltip-arrow" />
    </div>
  );
}
