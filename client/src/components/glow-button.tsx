import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "accent";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function GlowButton({ 
  children, 
  variant = "primary", 
  isLoading, 
  fullWidth, 
  className = "", 
  disabled,
  ...props 
}: GlowButtonProps) {
  
  const colors = variant === "primary" 
    ? "bg-primary/20 text-primary border-primary/50 hover:bg-primary/30 hover:border-primary hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]" 
    : "bg-accent/20 text-accent border-accent/50 hover:bg-accent/30 hover:border-accent hover:shadow-[0_0_20px_rgba(176,38,255,0.4)]";

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={`
        relative px-6 py-3 rounded-xl border backdrop-blur-sm
        font-display font-bold tracking-widest uppercase text-sm
        transition-all duration-300 flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${colors}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
