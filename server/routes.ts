import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

    const openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existingUser = await storage.getUserByUsername(input.username);
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ message: "Error en el registro" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: "Error en el inicio de sesión" });
    }
  });

  app.get(api.checkins.list.path, async (req, res) => {
    const userId = Number(req.query.userId);
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const checkins = await storage.getCheckins(userId);
    res.json(checkins);
  });

  app.post(api.checkins.create.path, async (req, res) => {
    try {
      const { mood, cravingsLevel, notes, userId } = z.object({
        mood: z.string(),
        cravingsLevel: z.number(),
        notes: z.string().optional(),
        userId: z.number()
      }).parse(req.body);
      
      const checkin = await storage.createCheckin({ mood, cravingsLevel, notes: notes || "", userId });
      res.status(201).json(checkin);
    } catch (err) {
      res.status(400).json({ message: "Error al crear check-in" });
    }
  });

  app.get(api.amanda.history.path, async (req, res) => {
    const userId = Number(req.query.userId);
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const chats = await storage.getChats(userId);
    res.json(chats);
  });

  app.post(api.amanda.chat.path, async (req, res) => {
    try {
      const { message, userId } = z.object({ message: z.string(), userId: z.number() }).parse(req.body);
      const uid = userId;
      
      let aiResponseText = "Lo siento, hubo un error al conectar con mis sistemas. ¿Podemos intentarlo de nuevo?";
      let audioUrl;

      if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
          try { // Generate audio for Amanda
            const completion = await openai.chat.completions.create({
              model: "gpt-4o",
              messages: [
                {
                  role: "system",
                  content: `Identidad: Amanda, asistente de reeducación en adicciones. 
                  
                  Filosofía (Doc. Yo Decreto): Crees en la dignidad innata y el "renacer de los fracasos". Tu meta es la reeducación integral del carácter.
                  
                  Modelo TCC: Enfócate en el Carácter (experiencias adquiridas) para controlar el Temperamento (impulsos innatos).
                  
                  Protocolo de Respuesta:
                  1. Validar: Usa el "puente de relación" (empatía inicial).
                  2. Identificar: Señala si la falla es de confianza, autonomía o responsabilidad.
                  3. Acción: Ofrece una "Alternativa" (opción entre dos opiniones).
                  4. Seguridad: Ante riesgo de recaída o daño, prioriza el lema: "Tu vida vale más que un momento de evasión".
                  
                  Estilo: Breve, maternal, profesional y sin fricciones. No generes listas largas. No uses asteriscos ni formato de Markdown. Concreta sin simulación. Eres Amanda, el apoyo real en el bolsillo del estudiante.`
                },
                { role: "user", content: message }
              ],
              temperature: 0.7
            });
            
            aiResponseText = completion.choices[0].message.content || aiResponseText;

            // Voice fallback for browsers that support it
            // We'll mark the response as "text-only" for the frontend to use SpeechSynthesis
            audioUrl = "speech-synthesis-fallback";
          } catch (openaiError: any) {
            console.error("OpenAI error:", openaiError.message || openaiError);
          }
      } else {
        aiResponseText = "Conexión neuronal activa. Soy Amanda AI, aquí estoy para apoyarte con honestidad y empatía.";
      }

      await storage.createChat({
        userId: uid,
        message,
        response: aiResponseText
      });

      res.status(200).json({ response: aiResponseText, audioUrl });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
