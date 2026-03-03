import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { useUser } from "./use-auth";

export function useCheckins() {
  const { data: user } = useUser();
  return useQuery({
    queryKey: [api.checkins.list.path, user?.id],
    queryFn: async () => {
      const res = await fetch(`${api.checkins.list.path}?userId=${user?.id || 1}`);
      if (!res.ok) throw new Error("Failed to fetch checkins");
      return api.checkins.list.responses[200].parse(await res.json());
    },
    enabled: !!user,
  });
}

export function useCreateCheckin() {
  const queryClient = useQueryClient();
  const { data: user } = useUser();
  
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.checkins.create.input>) => {
      const res = await fetch(api.checkins.create.path, {
        method: api.checkins.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: user?.id || 1 }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to create checkin");
      }
      
      return api.checkins.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.checkins.list.path, user?.id] });
    },
  });
}
