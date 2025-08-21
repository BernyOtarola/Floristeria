import { useQuery } from "@tanstack/react-query";

type SessionUser =
  | { id: string; email?: string | null; name?: string | null; username?: string | null; role: "admin" | "user" }
  | null;

export function useSession() {
  return useQuery<{ user: SessionUser }>({
    queryKey: ["session/me"],
    queryFn: async () => {
      const r = await fetch("/api/session/me", { credentials: "include" });
      if (!r.ok) return { user: null };
      return r.json();
    },
    staleTime: 30_000,
  });
}