import React from "react";
import { LucideIcon } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-magazine-accent hover:bg-accent-700 text-white focus:ring-magazine-accent shadow-lg hover:shadow-xl",
    secondary:
      "bg-magazine-secondary hover:bg-dark-700 text-white focus:ring-magazine-accent border border-magazine-border",
    outline:
      "border-2 border-magazine-accent text-magazine-accent hover:bg-magazine-accent hover:text-white focus:ring-magazine-accent",
    ghost:
      "text-magazine-text hover:text-white hover:bg-white/10 focus:ring-magazine-accent",
    danger:
      "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-lg hover:shadow-xl",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `.trim();

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          {children}
        </>
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <Icon size={iconSizes[size]} className="mr-2" />
          )}
          {children}
          {Icon && iconPosition === "right" && (
            <Icon size={iconSizes[size]} className="ml-2" />
          )}
        </>
      )}
    </button>
  );
};

export default Button;
