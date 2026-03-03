import React from "react";
import { motion } from "framer-motion";

interface HoloCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "primary" | "accent" | "danger";
  delay?: number;
}

export function HoloCard({ children, className = "", variant = "primary", delay = 0, ...props }: HoloCardProps) {
  const baseClass = variant === "primary" ? "holo-panel" : 
                    variant === "accent" ? "holo-panel-accent" : 
                    "bg-card/60 backdrop-blur-md border border-destructive/30 shadow-[0_0_15px_rgba(255,0,100,0.1)]";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className={`${baseClass} rounded-2xl p-6 ${className}`}
      {...props}
    >
      {/* Corner accents */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-xl opacity-50 ${variant === 'primary' ? 'border-primary' : 'border-accent'}`} />
      <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-xl opacity-50 ${variant === 'primary' ? 'border-primary' : 'border-accent'}`} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-xl opacity-50 ${variant === 'primary' ? 'border-primary' : 'border-accent'}`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-xl opacity-50 ${variant === 'primary' ? 'border-primary' : 'border-accent'}`} />
      
      {children}
    </motion.div>
  );
}
