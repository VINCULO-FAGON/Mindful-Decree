import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { HoloCard } from "@/components/holo-card";
import { GlowButton } from "@/components/glow-button";
import { useCheckins, useCreateCheckin } from "@/hooks/use-checkins";
import { useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Activity, Plus, Frown, Meh, Smile, Zap } from "lucide-react";

export default function Checkins() {
  const { data: user } = useUser();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  const { data: checkins = [], isLoading } = useCheckins();
  const createCheckin = useCreateCheckin();
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState<"bad" | "neutral" | "good">("neutral");
  const [cravings, setCravings] = useState(5);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCheckin.mutate({
      mood,
      cravingsLevel: cravings,
      notes,
      triggers: [] // Simple version
    }, {
      onSuccess: () => {
        toast({ title: "Registro exitoso", description: "Tu estado ha sido guardado en la red." });
        setShowForm(false);
        setMood("neutral");
        setCravings(5);
        setNotes("");
      }
    });
  };

  const getMoodIcon = (m: string) => {
    if (m === "bad") return <Frown className="w-5 h-5 text-destructive" />;
    if (m === "good") return <Smile className="w-5 h-5 text-primary" />;
    return <Meh className="w-5 h-5 text-accent" />;
  };

  return (
    <Layout>
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display text-glow-accent text-accent flex items-center gap-2">
            <Activity className="w-6 h-6" /> Telemetría
          </h1>
          <p className="text-sm text-muted-foreground">Registro de estado diario</p>
        </div>
        {!showForm && (
          <GlowButton variant="accent" onClick={() => setShowForm(true)} className="px-4 py-2 text-xs">
            <Plus className="w-4 h-4 mr-1" /> NUEVO
          </GlowButton>
        )}
      </header>

      {showForm ? (
        <HoloCard variant="accent" className="mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-mono text-accent mb-3 uppercase">Estado Emocional</label>
              <div className="flex gap-4">
                {(["bad", "neutral", "good"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`flex-1 py-4 rounded-xl border flex justify-center items-center transition-all ${
                      mood === m 
                        ? 'bg-accent/20 border-accent shadow-[0_0_15px_rgba(176,38,255,0.3)]' 
                        : 'bg-background/50 border-white/10 hover:border-accent/50'
                    }`}
                  >
                    {getMoodIcon(m)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex justify-between text-sm font-mono text-accent mb-3 uppercase">
                <span>Nivel de Antojo (Craving)</span>
                <span className="text-white">{cravings}/10</span>
              </label>
              <input 
                type="range" 
                min="0" max="10" 
                value={cravings}
                onChange={(e) => setCravings(Number(e.target.value))}
                className="w-full accent-accent"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--destructive)) 100%)`,
                  height: '4px',
                  borderRadius: '2px',
                  appearance: 'none',
                  outline: 'none'
                }}
              />
              <style>{`
                input[type=range]::-webkit-slider-thumb {
                  appearance: none;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: white;
                  box-shadow: 0 0 10px rgba(255,255,255,0.8);
                  cursor: pointer;
                }
              `}</style>
            </div>

            <div>
              <label className="block text-sm font-mono text-accent mb-3 uppercase">Notas / Desencadenantes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Qué ocurrió hoy? ¿Qué sentiste?"
                rows={3}
                className="w-full bg-background/50 border border-accent/30 rounded-xl p-4 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:bg-white/5 transition-colors font-mono text-sm"
              >
                CANCELAR
              </button>
              <GlowButton type="submit" variant="accent" isLoading={createCheckin.isPending} className="flex-1">
                GUARDAR
              </GlowButton>
            </div>
          </form>
        </HoloCard>
      ) : null}

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Cargando registros...</p>
        ) : checkins.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-background/30">
            <Zap className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-mono text-sm uppercase">Sin registros en la base de datos</p>
          </div>
        ) : (
          checkins.map((checkin, i) => (
            <motion.div
              key={checkin.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card/40 border border-white/5 p-4 rounded-xl hover:border-accent/30 transition-colors flex items-start gap-4"
            >
              <div className="mt-1 p-2 bg-background rounded-lg border border-white/10">
                {getMoodIcon(checkin.mood)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-mono text-white/40">
                    {new Date(checkin.createdAt!).toLocaleDateString()} - {new Date(checkin.createdAt!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                    checkin.cravingsLevel > 7 ? 'bg-destructive/20 text-destructive' : 
                    checkin.cravingsLevel > 4 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-primary/20 text-primary'
                  }`}>
                    Craving: {checkin.cravingsLevel}
                  </span>
                </div>
                {checkin.notes && (
                  <p className="text-sm text-white/80 mt-2">{checkin.notes}</p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </Layout>
  );
}
