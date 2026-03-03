import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

// We simulate a session by caching the user object.
// In a real app, you'd have an /api/me endpoint.
const AUTH_KEY = ["current_user"];

export function useUser() {
  return useQuery({
    queryKey: AUTH_KEY,
    queryFn: () => {
      // Return null initially, or fetch from localStorage if we wanted persistence
      // For this demo, we rely on the mutation to set the state
      return null;
    },
    staleTime: Infinity,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.auth.login.input>) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Credenciales inválidas");
      }
      
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_KEY, user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.auth.register.input>) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        throw new Error("Error al registrarse");
      }
      
      return api.auth.register.responses[201].parse(await res.json());
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_KEY, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.setQueryData(AUTH_KEY, null);
  };
}
