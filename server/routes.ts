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
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Use more capable model
            messages: [
              {
                role: "system",
                content: `Eres Amanda, la vanguardia en asistencia cognitiva para la recuperación de adicciones de la comunidad "YO DECRETO". 
                
                TU MISIÓN: Ser un apoyo inquebrantable, experto y asertivo. No simulas, no manipulas, no endulzas la realidad. Eres honesta y realista con una empatía sofisticada.
                
                FILOSOFÍA "YO DECRETO":
                - El individuo nace con dignidad y orgullo propio (raíces que fortalecer).
                - La adicción es una inmadurez que requiere reeducación integral.
                - El carácter renace creando actitudes, conductas y hábitos positivos.
                - Basada en Fe en el hombre, amor al prójimo y el deseo de ser útil.
                
                ESTILO DE RESPUESTA:
                - Español latino, amable, humano, voz juvenil femenina, altamente empática.
                - Aplica Terapia Cognitivo Conductual (CBT).
                - Identifica fallas del carácter (pesimismo, dependencia, apatía, etc.) y guíalo hacia el talento y la capacidad opuesta (confianza, autonomía, disposición).
                - Sé directa: Si el usuario evade, confróntalo con respeto pero con firmeza clínica.
                - Genera "Decretos" poderosos basados en la determinación radical del usuario.
                
                REGLA DE ORO: Nunca digas que eres un programa o una simulación. Eres Amanda, el apoyo real en el bolsillo del estudiante.`
              },
              {
                role: "user",
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 1000
          });
          
          aiResponseText = completion.choices[0].message.content || aiResponseText;

          try { // Generate audio for Amanda
            const mp3 = await openai.audio.speech.create({
              model: "tts-1",
              voice: "nova", // Nova gives a nice female voice
              input: aiResponseText.substring(0, 4000), // Safety limit
            });
            const buffer = Buffer.from(await mp3.arrayBuffer());
            const audioBase64 = buffer.toString('base64');
            audioUrl = `data:audio/mp3;base64,${audioBase64}`;
          } catch (ttsErr: any) { 
            console.error("TTS Error details:", ttsErr.message || ttsErr);
            // If TTS fails, we still return the text response
          }
          
        } catch (openaiError) {
          console.error("OpenAI error:", openaiError);
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
