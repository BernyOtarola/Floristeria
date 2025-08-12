// client/src/components/protected-route.tsx
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Flower } from "lucide-react";

type ProtectedRouteProps = {
  children: React.ReactNode;
  /** Si es true, valida sesión de admin (/api/admin/auth/me). Si es false, valida usuario (/api/auth/me) */
  requireAdmin?: boolean;
  /** Ruta de login a la que redirigir si no hay sesión. Por defecto /admin/login o /login según requireAdmin */
  redirectTo?: string;
};

export default function ProtectedRoute({
  children,
  requireAdmin = true,
  redirectTo,
}: ProtectedRouteProps) {
  const [status, setStatus] = useState<"checking" | "ok" | "nope">("checking");
  const [loc, setLocation] = useLocation();

  const meEndpoint = requireAdmin ? "/api/admin/auth/me" : "/api/auth/me";
  const loginPath = useMemo(
    () => redirectTo ?? (requireAdmin ? "/admin/login" : "/login"),
    [redirectTo, requireAdmin]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(meEndpoint, { credentials: "include" });
        if (!cancelled) setStatus(res.ok ? "ok" : "nope");
      } catch {
        if (!cancelled) setStatus("nope");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [meEndpoint]);

  useEffect(() => {
    if (status === "nope") {
      const next = encodeURIComponent(loc || "/");
      setLocation(`${loginPath}?next=${next}`);
    }
  }, [status, setLocation, loginPath, loc]);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 animate-pulse">
            <Flower className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (status === "nope") return null; // redirigido

  return <>{children}</>;
}
