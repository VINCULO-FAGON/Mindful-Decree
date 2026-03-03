import { useUser } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { HoloCard } from "@/components/holo-card";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Activity, MessageCircle, Shield, BrainCircuit, Sparkles } from "lucide-react";

export default function Home() {
  const { data: user } = useUser();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation("/login");
    return null;
  }

  const modules = [
    {
      title: "Amanda AI",
      desc: "Asistencia cognitiva experta y apoyo empático 24/7.",
      icon: BrainCircuit,
      href: "/chat",
      color: "text-primary",
      bg: "bg-primary/10",
      delay: 0.1
    },
    {
      title: "Check-in Diario",
      desc: "Monitorea tu estado, antojos y factores desencadenantes.",
      icon: Activity,
      href: "/checkins",
      color: "text-accent",
      bg: "bg-accent/10",
      delay: 0.2
    },
    {
      title: "Filosofía Base",
      desc: "Principios cognitivo-conductuales para la recuperación.",
      icon: Shield,
      href: "/philosophy",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      delay: 0.3
    }
  ];

  return (
    <Layout>
      <div className="space-y-8 pb-10">
        
        <header className="pt-8 pb-4 border-b border-primary/20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Sparkles className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-2xl text-glow-primary">Bienvenido, {user.username}</h1>
              <p className="text-sm font-mono text-primary/70 uppercase">
                Días Limpio: <span className="text-white text-glow-primary text-lg">{user.cleanDays || 0}</span>
              </p>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HoloCard variant="primary" className="md:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <MessageCircle className="w-32 h-32 text-primary" />
            </div>
            <h2 className="text-xl font-display text-primary mb-2">Yo Decreto</h2>
            <p className="text-muted-foreground max-w-md relative z-10">
              "Declaro que tengo el control de mis decisiones. Este espacio está diseñado para fortalecer mi mente, procesar mis emociones y guiarme hacia una vida libre de ataduras."
            </p>
          </HoloCard>

          {modules.map((mod) => (
            <Link key={mod.href} href={mod.href}>
              <HoloCard 
                delay={mod.delay}
                className="cursor-pointer hover:border-primary/50 transition-all group h-full flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl ${mod.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <mod.icon className={`w-6 h-6 ${mod.color}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{mod.title}</h3>
                  <p className="text-sm text-muted-foreground">{mod.desc}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <span className={`text-xs uppercase tracking-widest font-mono ${mod.color} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
                    Acceder <span className="text-lg leading-none">›</span>
                  </span>
                </div>
              </HoloCard>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
