import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { HoloCard } from "@/components/holo-card";
import { GlowButton } from "@/components/glow-button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Fingerprint, User, Lock } from "lucide-react";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const login = useLogin();
  const register = useRegister();
  
  const { data: user } = useUser();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (user) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Error", description: "Completa todos los campos", variant: "destructive" });
      return;
    }

    const action = isLogin ? login : register;
    action.mutate({ username, password }, {
      onSuccess: () => {
        toast({ 
          title: isLogin ? "Acceso concedido" : "Identidad registrada", 
          description: "Iniciando secuencia principal..." 
        });
        setLocation("/");
      },
      onError: (err: any) => {
        toast({ title: "Error de autenticación", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative scanline">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 border border-primary/30 mb-4 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
            <Fingerprint className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-display text-glow-primary text-white font-bold tracking-[0.2em] uppercase">
            Yo Decreto
          </h1>
          <p className="text-primary/70 mt-2 font-mono text-sm tracking-widest">
            SISTEMA DE APOYO Y REHABILITACIÓN
          </p>
        </motion.div>

        <HoloCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-primary/50">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="IDENTIFICADOR"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background/50 border border-primary/20 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-primary/50">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="CÓDIGO DE ACCESO"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background/50 border border-primary/20 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono"
                />
              </div>
            </div>

            <GlowButton 
              type="submit" 
              fullWidth 
              isLoading={login.isPending || register.isPending}
            >
              {isLogin ? "INICIAR CONEXIÓN" : "CREAR IDENTIDAD"}
            </GlowButton>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
              >
                {isLogin 
                  ? "¿NUEVO USUARIO? INICIAR REGISTRO" 
                  : "¿YA TIENES ACCESO? CONECTAR"}
              </button>
            </div>
          </form>
        </HoloCard>
      </div>
    </div>
  );
}
