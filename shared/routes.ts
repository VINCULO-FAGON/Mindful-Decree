import { z } from 'zod';
import { insertUserSchema, insertCheckinSchema, insertChatSchema, users, dailyCheckins, amandaChats } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.internal,
      },
    },
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  checkins: {
    list: {
      method: 'GET' as const,
      path: '/api/checkins' as const,
      responses: {
        200: z.array(z.custom<typeof dailyCheckins.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/checkins' as const,
      input: insertCheckinSchema,
      responses: {
        201: z.custom<typeof dailyCheckins.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  amanda: {
    chat: {
      method: 'POST' as const,
      path: '/api/amanda/chat' as const,
      input: z.object({ message: z.string() }),
      responses: {
        200: z.object({
          response: z.string(),
          audioUrl: z.string().optional()
        }),
        500: errorSchemas.internal,
      },
    },
    history: {
      method: 'GET' as const,
      path: '/api/amanda/history' as const,
      responses: {
        200: z.array(z.custom<typeof amandaChats.$inferSelect>()),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
