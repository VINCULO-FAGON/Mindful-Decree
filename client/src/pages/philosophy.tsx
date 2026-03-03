import { Layout } from "@/components/layout";
import { HoloCard } from "@/components/holo-card";
import { Shield, Target, Brain, ArrowUpRight } from "lucide-react";

export default function Philosophy() {
  const principles = [
    {
      icon: Target,
      title: "Determinación Radical",
      content: "Asumir la total responsabilidad de la propia recuperación, rechazando la mentalidad de víctima. El cambio comienza cuando 'decretas' que la sustancia no domina tu voluntad."
    },
    {
      icon: Brain,
      title: "Reestructuración Cognitiva",
      content: "Identificar y desafiar los pensamientos irracionales y excusas que justifican el consumo. Reemplazar 'no puedo evitarlo' por 'elijo no hacerlo en este momento'."
    },
    {
      icon: Shield,
      title: "Prevención de Recaídas",
      content: "La recaída no es un fracaso repentino, sino un proceso predecible. Anticipar los desencadenantes (personas, lugares, emociones) y tener un plan de acción defensivo preparado."
    }
  ];

  return (
    <Layout>
      <div className="space-y-6 pb-10">
        <header className="text-center py-6">
          <h1 className="text-3xl font-display text-glow-primary text-primary tracking-widest uppercase mb-2">
            Principios Base
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Fundamentos cognitivo-conductuales implementados en la matriz del sistema para la rehabilitación y educación.
          </p>
        </header>

        <HoloCard variant="primary" className="border-l-4 border-l-primary">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <ArrowUpRight className="text-primary" /> 
            El Poder del "Yo Decreto"
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            La palabra tiene poder sobre la mente. Al declarar "Yo Decreto", pasamos de la pasividad a la proactividad. Este marco no simula curas mágicas, sino que provee herramientas asertivas y honestas para confrontar la enfermedad del trastorno por consumo, basado en la reestructuración de esquemas mentales.
          </p>
        </HoloCard>

        <div className="space-y-4">
          <h3 className="font-display text-muted-foreground tracking-widest uppercase text-sm pl-2">Pilares Estratégicos</h3>
          
          {principles.map((p, idx) => (
            <HoloCard key={idx} variant="accent" className="bg-card/30 backdrop-blur-sm border-white/5 hover:border-accent/30 transition-colors">
              <div className="flex gap-4">
                <div className="mt-1 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                    <p.icon className="w-5 h-5 text-accent drop-shadow-[0_0_8px_rgba(176,38,255,0.8)]" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">{p.title}</h4>
                  <p className="text-sm text-white/70 leading-relaxed">{p.content}</p>
                </div>
              </div>
            </HoloCard>
          ))}
        </div>
      </div>
    </Layout>
  );
}
