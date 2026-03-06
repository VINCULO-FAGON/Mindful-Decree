import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@shared/routes";
import { z } from "zod";

// We simulate a session by caching the user object.
// In a real app, you'd have an /api/me endpoint.
const AUTH_KEY = ["current_user"];

export function useUser() {
  return useQuery({
    queryKey: AUTH_KEY,
    queryFn: () => {
      const stored = localStorage.getItem("yo_decreto_user");
      return stored ? JSON.parse(stored) : null;
    },
    staleTime: Infinity,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.auth.login.input>) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Credenciales inválidas");
      }
      
      const user = api.auth.login.responses[200].parse(await res.json());
      localStorage.setItem("yo_decreto_user", JSON.stringify(user));
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_KEY, user);
      setLocation("/");
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.auth.register.input>) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al registrarse");
      }
      
      const user = api.auth.register.responses[201].parse(await res.json());
      localStorage.setItem("yo_decreto_user", JSON.stringify(user));
      return user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_KEY, user);
      setLocation("/");
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  return () => {
    localStorage.removeItem("yo_decreto_user");
    queryClient.setQueryData(AUTH_KEY, null);
    queryClient.clear();
    setLocation("/login");
  };
}
