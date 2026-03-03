import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, MessageCircle, Activity, BookOpen, LogOut } from "lucide-react";
import { useLogout } from "@/hooks/use-auth";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const logout = useLogout();

  const navItems = [
    { href: "/", icon: Home, label: "Inicio" },
    { href: "/chat", icon: MessageCircle, label: "Amanda" },
    { href: "/checkins", icon: Activity, label: "Estado" },
    { href: "/philosophy", icon: BookOpen, label: "Principios" },
  ];

  return (
    <div className="min-h-screen flex flex-col scanline relative">
      {/* Top Bar - Holographic Navigation */}
      <header className="sticky top-0 z-40 w-full pt-4 px-4 pb-2">
        <nav className="max-w-2xl mx-auto holo-panel rounded-full px-6 py-3 flex items-center justify-between">
          <div className="flex space-x-1 sm:space-x-4 w-full justify-between items-center">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="relative group p-2">
                  <div className="flex flex-col items-center">
                    <Icon 
                      className={`w-6 h-6 transition-all duration-300 ${
                        isActive 
                          ? "text-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" 
                          : "text-muted-foreground group-hover:text-primary/70"
                      }`} 
                    />
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator"
                        className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_rgba(0,240,255,1)]"
                      />
                    )}
                  </div>
                </Link>
              );
            })}
            
            <button 
              onClick={logout}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors duration-300"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 flex flex-col">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>
      
      {/* Decorative ambient background glows */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="fixed bottom-20 right-10 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none -z-10" />
    </div>
  );
}
