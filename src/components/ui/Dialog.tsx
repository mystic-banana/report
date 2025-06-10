import React, { Fragment, useState } from 'react';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const DialogOverlay = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <HeadlessDialog.Overlay 
    className={`fixed inset-0 bg-black/50 backdrop-blur-sm ${className || ''}`} 
    {...props} 
  />
);

const DialogContent = ({ 
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <HeadlessDialog.Panel
    className={`fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 bg-dark-900 border border-dark-700 p-6 rounded-lg shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] ${className || ''}`}
    {...props}
  >
    {children}
  </HeadlessDialog.Panel>
);

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex flex-col space-y-1.5 text-center sm:text-left ${className || ''}`}
    {...props}
  />
);

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`}
    {...props}
  />
);

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <HeadlessDialog.Title
    ref={ref}
    className={`text-lg font-semibold leading-none tracking-tight text-white ${className || ''}`}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <HeadlessDialog.Description
    ref={ref}
    className={`text-sm text-gray-400 ${className || ''}`}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  return (
    <Transition show={open} as={Fragment}>
      <HeadlessDialog
        as="div"
        className="relative z-50"
        onClose={() => onOpenChange(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogOverlay />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {children}
            </Transition.Child>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
};

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ asChild, children, ...props }, ref) => {
  const Trigger = asChild ? React.Children.only(children as React.ReactElement) : 'button';
  
  // If asChild is true, clone the child and forward the ref
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, { 
      ...props,
      ref,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        props.onClick?.(e);
        (children as React.ReactElement).props.onClick?.(e);
      }
    });
  }
  
  return (
    <button
      ref={ref}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
});
DialogTrigger.displayName = "DialogTrigger";

const DialogClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ asChild, className, children, ...props }, ref) => {
  const Child = asChild ? React.Children.only(children as React.ReactElement) : undefined;
  
  if (asChild && Child) {
    return React.cloneElement(Child, { 
      ...props,
      ref,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        props.onClick?.(e);
        Child.props.onClick?.(e);
      }
    });
  }
  
  return (
    <button
      ref={ref}
      className={`absolute right-4 top-4 rounded-sm opacity-70 ring-offset-dark-900 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-dark-700 focus:ring-offset-2 disabled:pointer-events-none ${className || ''}`}
      {...props}
    >
      {children || <X className="h-4 w-4" />}
      <span className="sr-only">Close</span>
    </button>
  );
});
DialogClose.displayName = "DialogClose";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
};
