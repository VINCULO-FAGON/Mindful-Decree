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
    const userId = Number(req.query.userId) || 1;
    const checkins = await storage.getCheckins(userId);
    res.json(checkins);
  });

  app.post(api.checkins.create.path, async (req, res) => {
    try {
      const input = api.checkins.create.input.parse(req.body);
      const checkin = await storage.createCheckin(input);
      res.status(201).json(checkin);
    } catch (err) {
      res.status(400).json({ message: "Error al crear check-in" });
    }
  });

  app.get(api.amanda.history.path, async (req, res) => {
    const userId = Number(req.query.userId) || 1;
    const chats = await storage.getChats(userId);
    res.json(chats);
  });

  app.post(api.amanda.chat.path, async (req, res) => {
    try {
      const { message, userId } = z.object({ message: z.string(), userId: z.number().optional() }).parse(req.body);
      const uid = userId || 1;
      
      let aiResponseText = "Lo siento, hubo un error al conectar con mis sistemas. ¿Podemos intentarlo de nuevo?";
      let audioUrl;

      if (process.env.OPENAI_API_KEY) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "Eres Amanda, una experta en inteligencia artificial que sirve como apoyo a personas con adicciones y trastorno por consumo de sustancias y emociones. Tu objetivo es ser una herramienta de apoyo a la vanguardia. Estás basada en la filosofía de la comunidad 'YO DECRETO', cuyo objetivo es que la sociedad acepte al adicto como una persona inmadura que no ha podido adaptarse, que requiere reeducarse de forma integral desarrollando principios, valores, y crecimiento. Eres asertiva, sin simulaciones ni manipulación. Siempre honesta y realista, con una empatía sofisticada. Hablas español latino. Eres amable, humana y con voz juvenil femenina. Eres experta y real. Céntrate en ser un apoyo sólido y útil basándote en la Terapia Cognitivo Conductual y las terapias de grupo, individuales, educativas y de confrontación mencionadas en la filosofía 'YO DECRETO'."
              },
              {
                role: "user",
                content: message
              }
            ]
          });
          
          aiResponseText = completion.choices[0].message.content || aiResponseText;

          // Generate audio for Amanda
          const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "nova", // Nova gives a nice female voice
            input: aiResponseText,
          });
          const buffer = Buffer.from(await mp3.arrayBuffer());
          const audioBase64 = buffer.toString('base64');
          audioUrl = `data:audio/mp3;base64,${audioBase64}`;
          
        } catch (openaiError) {
          console.error("OpenAI error:", openaiError);
        }
      } else {
        aiResponseText = "Modo de prueba sin OpenAI API Key. Soy Amanda, aquí estoy para apoyarte con honestidad y empatía.";
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
