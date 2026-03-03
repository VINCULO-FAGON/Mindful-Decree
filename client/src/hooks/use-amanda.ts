import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

export function useAmandaHistory() {
  return useQuery({
    queryKey: [api.amanda.history.path],
    queryFn: async () => {
      const res = await fetch(api.amanda.history.path);
      if (!res.ok) throw new Error("Failed to fetch chat history");
      return api.amanda.history.responses[200].parse(await res.json());
    },
  });
}

export function useAmandaChat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(api.amanda.chat.path, {
        method: api.amanda.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      
      if (!res.ok) {
        throw new Error("Error connecting to Amanda");
      }
      
      return api.amanda.chat.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.amanda.history.path] });
    },
  });
}
