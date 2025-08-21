import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lee ?next=/ruta y evita URLs externas
  const next = useMemo(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const raw = sp.get("next") || "/";
      return raw.startsWith("/") ? raw : "/";
    } catch {
      return "/";
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => null))?.message ?? "Credenciales inválidas";
        toast({ title: "Error", description: msg, variant: "destructive" });
        return;
      }

      // El servidor devuelve { ..., role: "admin"|"user" }
      const data = (await res.json()) as { role?: "admin" | "user" } | null;

      // Si es admin, ir al panel admin (a menos que haya next explícito no-admin)
      if (data?.role === "admin") {
        // Si el next apunta a /admin lo respetamos; si apunta a otra vista, priorizamos /admin
        const go = next === "/" || next.startsWith("/login") ? "/admin" : next;
        window.location.assign(go.startsWith("/admin") ? go : "/admin");
        return;
      }

      // Usuario normal: si el next es /admin, lo ignoramos y vamos al home
      const safeNext = next.startsWith("/admin") ? "/" : next;
      window.location.assign(safeNext);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const registerHref = `/register?next=${encodeURIComponent(next)}`;

  return (
    <div className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Fondo en degradado acorde a la colorimetría (rosa → fucsia) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600" />

      {/* Flores decorativas */}
      <span className="flower-bg absolute left-[10%] top-[12%] text-7xl opacity-20 select-none">🌸</span>
      <span className="flower-bg absolute right-[12%] top-[20%] text-6xl opacity-20 select-none [animation-delay:5s]">🌺</span>
      <span className="flower-bg absolute left-[15%] bottom-[18%] text-7xl opacity-20 select-none [animation-delay:10s]">🌷</span>
      <span className="flower-bg absolute right-[18%] bottom-[10%] text-8xl opacity-20 select-none [animation-delay:15s]">🌹</span>

      {/* Card “glass” */}
      <section className="relative z-10 w-full max-w-[440px] rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl p-8 mx-4 animate-[slideUp_.5s_ease-out]">
        {/* Logo / título */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-2 animate-[bloom_2s_ease-in-out_infinite]">🌻</div>
          <h1 className="text-2xl font-serif text-gray-900">Bienvenido de vuelta</h1>
          <p className="text-sm text-gray-500">Ingresa a tu jardín de flores favorito</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Correo electrónico</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-5 h-5" />
              </span>
              <Input
                id="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-11 rounded-xl border-2 bg-slate-50 focus:bg-white focus:border-fuchsia-400"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 pr-10 h-11 rounded-xl border-2 bg-slate-50 focus:bg-white focus:border-fuchsia-400"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Recordarme / Olvidé contraseña (solo UI) */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" className="accent-fuchsia-600" />
              Recuérdame
            </label>
            <a className="text-fuchsia-600 hover:underline" href="#">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Botón principal */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl font-semibold text-white
                       bg-gradient-to-br from-rose-500 to-fuchsia-600
                       hover:from-rose-600 hover:to-fuchsia-700
                       transition-transform hover:-translate-y-[2px] shadow-lg"
          >
            {loading ? "Ingresando…" : "Iniciar sesión 🌺"}
          </Button>
        </form>

        {/* Link a registro */}
        <p className="text-center text-sm text-gray-500 mt-5">
          ¿No tienes cuenta?{" "}
          <a href={registerHref} className="text-fuchsia-600 font-semibold hover:underline">
            Regístrate aquí
          </a>
        </p>
      </section>

      {/* Animaciones CSS específicas para este componente */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bloom {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-12px) rotate(4deg); }
          50% { transform: translateY(0) rotate(-4deg); }
          75% { transform: translateY(12px) rotate(3deg); }
        }
        .flower-bg { animation: float 18s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
