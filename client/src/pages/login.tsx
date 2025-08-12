import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Me = { id: string; username: string; email: string | null; role: string } | null;

export default function LoginPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState<Me>(null);
  const [checking, setChecking] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const next = params.get("next") || "/";

  // En vez de redirigir automáticamente, solo detectamos si hay sesión
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        if (!cancelled && r.ok) {
          const data = await r.json();
          setMe(data.user as Me);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        toast({ title: "Error", description: "Credenciales inválidas", variant: "destructive" });
        return;
      }
      toast({ title: "Listo", description: "Sesión iniciada" });
      setLocation(next);
    } catch {
      toast({ title: "Error", description: "No se pudo iniciar sesión", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    setMe(null);
    toast({ title: "Sesión cerrada" });
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Cargando…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Accede a tu cuenta para guardar pedidos y recibir novedades</CardDescription>
        </CardHeader>

        <CardContent>
          {me ? (
            <div className="space-y-4">
              <div className="p-3 rounded-md bg-green-50 text-green-800 text-sm">
                Ya tienes una sesión activa {me.email ? `(${me.email})` : ""}.
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href={next}>Ir a la página anterior</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/">Ir al inicio</Link>
                </Button>
                {me.role?.includes("admin") && (
                  <Button asChild>
                    <Link href="/admin/dashboard">Ir al Admin</Link>
                  </Button>
                )}
              </div>
              <Button variant="ghost" onClick={logout}>Cerrar sesión</Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Ingresando..." : "Iniciar sesión"}
              </Button>

              <p className="text-sm text-gray-600 mt-2">
                ¿No tienes cuenta?{" "}
                <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-primary underline">
                  Regístrate
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
