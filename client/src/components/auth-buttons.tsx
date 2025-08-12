import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function AuthButtons() {
  const [, setLocation] = useLocation();
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        if (r.ok) setMe((await r.json()).user);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return null;

  if (!me) {
    const next = encodeURIComponent(window.location.pathname || "/");
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/login?next=${next}`}>Iniciar sesión</Link>
        </Button>
        <Button asChild size="sm">
          <Link href={`/register?next=${next}`}>Registrarse</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/dashboard">Admin</Link>
      </Button>
      <Button variant="ghost" size="sm" onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        setMe(null); setLocation("/");
      }}>Cerrar sesión</Button>
    </div>
  );
}
