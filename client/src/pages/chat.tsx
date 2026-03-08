import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout";
import { useAmandaChat, useAmandaHistory } from "@/hooks/use-amanda";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Cpu, User, Volume2, Loader2, Copy, Mic, MicOff } from "lucide-react";
import { useUser } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: user } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-LA';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? " " : "") + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast({
          title: "Error de voz",
          description: "No se pudo procesar el audio.",
          variant: "destructive"
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast({
        title: "No soportado",
        description: "Tu navegador no soporta reconocimiento de voz.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Copiado al portapapeles",
    });
  };

  const playResponse = (audioUrl?: string, text?: string) => {
    if (!audioUrl && !text) {
      toast({
        description: "El audio se está procesando o no está disponible.",
      });
      return;
    }

    if (audioUrl === "speech-synthesis-fallback" || (!audioUrl && text)) {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text || "");
        utterance.lang = 'es-LA';
        utterance.rate = 0.95; // Natural speaking rate
        utterance.pitch = 1.3; // Higher pitch for feminine voice
        utterance.volume = 1.0;
        
        // Priority order for feminine Spanish voices
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        
        // First: Look for Google Spanish Female
        selectedVoice = voices.find(v => v.name.includes('Google') && v.lang === 'es-LA' && v.name.includes('Female'));
        
        // Second: Look for female-specific voices in Spanish LA
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang === 'es-LA' && (v.name.includes('Female') || v.name.includes('female')));
        }
        
        // Third: Look for any Spanish LA voice with feminine names
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith('es') && (v.name.includes('Helena') || v.name.includes('Laura') || v.name.includes('Elena') || v.name.includes('Paulina')));
        }
        
        // Fourth: Any Spanish voice
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith('es'));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        window.speechSynthesis.speak(utterance);
      } else {
        toast({ description: "Tu navegador no soporta síntesis de voz." });
      }
      return;
    }

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(e => {
        console.warn("Audio playback blocked:", e);
        toast({
          description: "Haz clic en la pantalla para permitir el audio.",
        });
      });
    }
  };

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);
  
  const { data: history = [], isLoading: historyLoading } = useAmandaHistory();
  const chatMutation = useAmandaChat();
  
  // Local state to show optimistic messages
  const [localMessages, setLocalMessages] = useState<Array<{role: 'user'|'amanda', content: string, audioUrl?: string}>>([]);

  useEffect(() => {
    if (history.length > 0 && localMessages.length === 0) {
      const formatted = history.flatMap(h => [
        { role: 'user' as const, content: h.message },
        { role: 'amanda' as const, content: h.response }
      ]);
      setLocalMessages(formatted);
    }
  }, [history]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, chatMutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const messageToSend = input;
    setInput("");
    
    setLocalMessages(prev => [...prev, { role: 'user', content: messageToSend }]);

    chatMutation.mutate(messageToSend, {
      onSuccess: (data) => {
        setLocalMessages(prev => [...prev, { 
          role: 'amanda', 
          content: data.response,
          audioUrl: data.audioUrl 
        }]);
        
        // Play audio if provided by the API
        if (data.audioUrl) {
          try {
            // Refined audio playback logic
            const audio = new Audio(data.audioUrl);
            audio.playbackRate = 1.05; // Slightly faster for more youthful energy
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
              playPromise.catch(e => {
                console.warn("Audio playback requires user interaction first:", e);
                // Fallback: the user needs to click something to enable audio if browser blocks it
              });
            }
          } catch (e) {
            console.error("Failed to play audio:", e);
          }
        }
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-6rem)] pb-4">
        
        <header className="flex items-center gap-3 pb-4 border-b border-primary/20 shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#00f0ff]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-glow-primary leading-tight">Amanda AI</h1>
            <p className="text-[10px] text-primary/70 font-mono flex items-center gap-1 uppercase tracking-tighter">
              <Volume2 className="w-3 h-3" /> Conexión Neural Activa
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2 custom-scrollbar" ref={scrollRef}>
          {historyLoading && localMessages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-primary/50">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : localMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <Cpu className="w-16 h-16 mb-4 text-primary" />
              <p className="font-display">CONEXIÓN ESTABLECIDA</p>
              <p className="text-sm">Hola, soy Amanda. Estoy aquí para escucharte y apoyarte con total honestidad.</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {localMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    <div className="shrink-0 mt-1">
                      {msg.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent flex items-center justify-center shadow-[0_0_10px_rgba(176,38,255,0.2)]">
                          <User className="w-4 h-4 text-accent" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                          <Cpu className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </div>

                    <div className={`p-4 rounded-2xl relative group/msg ${
                      msg.role === 'user' 
                        ? 'bg-accent/10 border border-accent/30 rounded-tr-sm text-foreground' 
                        : 'bg-primary/10 border border-primary/30 rounded-tl-sm text-primary-foreground text-white'
                    }`}>
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap pr-8">{msg.content}</p>
                      
                      <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                        <button 
                          onClick={() => copyToClipboard(msg.content)}
                          className="p-2 hover:bg-white/10 rounded-full transition-colors"
                          title="Copiar texto"
                        >
                          <Copy className="w-4 h-4 text-white/70" />
                        </button>
                        {msg.role === 'amanda' && (
                          <button 
                            onClick={() => {
                              playResponse(msg.audioUrl, msg.content);
                            }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            title="Escuchar respuesta"
                          >
                            <Volume2 className="w-4 h-4 text-white/70" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {chatMutation.isPending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-primary" />
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 rounded-tl-sm flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <div className="shrink-0 pt-2 flex gap-2">
          <form onSubmit={handleSubmit} className="relative flex-1 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe a Amanda..."
              disabled={chatMutation.isPending}
              className="w-full bg-card/80 backdrop-blur-md border border-primary/30 rounded-full py-4 pl-6 pr-14 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            />
            <button
              type="submit"
              disabled={!input.trim() || chatMutation.isPending}
              className="absolute right-2 p-2 bg-primary/20 text-primary rounded-full hover:bg-primary hover:text-background transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          
          <button
            onClick={toggleListening}
            disabled={chatMutation.isPending}
            className={`p-4 rounded-full border transition-all ${
              isListening 
                ? 'bg-destructive/20 border-destructive text-destructive animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.4)]' 
                : 'bg-card/80 border-primary/30 text-primary hover:border-primary shadow-[0_0_15px_rgba(0,0,0,0.5)]'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

      </div>
    </Layout>
  );
}
