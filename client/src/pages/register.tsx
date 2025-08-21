import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lee ?next=/ruta (sin Router)
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

    if (password.length < 6) {
      toast({
        title: "Contraseña muy corta",
        description: "Debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirm) {
      toast({
        title: "Las contraseñas no coinciden",
        description: "Asegúrate de escribir la misma contraseña.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => null))?.message ?? "Datos inválidos";
        toast({ title: "Error", description: msg, variant: "destructive" });
        return;
      }

      // Registro OK → redirigir
      window.location.assign(next);
    } catch {
      toast({
        title: "Error",
        description: "No se pudo crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const loginHref = `/login?next=${encodeURIComponent(next)}`;

  return (
    <div className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Fondo degradado Floristería (rosa → fucsia) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600" />

      {/* Flores decorativas */}
      <span className="flower-bg absolute left-[10%] top-[12%] text-7xl opacity-20 select-none">🌸</span>
      <span className="flower-bg absolute right-[12%] top-[20%] text-6xl opacity-20 select-none [animation-delay:5s]">🌺</span>
      <span className="flower-bg absolute left-[15%] bottom-[18%] text-7xl opacity-20 select-none [animation-delay:10s]">🌷</span>
      <span className="flower-bg absolute right-[18%] bottom-[10%] text-8xl opacity-20 select-none [animation-delay:15s]">🌹</span>

      {/* Card glass */}
      <section className="relative z-10 w-full max-w-[480px] rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl p-8 mx-4 animate-[slideUp_.5s_ease-out]">
        <div className="text-center mb-6">
          <div className="text-6xl mb-2 animate-[bloom_2s_ease-in-out_infinite]">🌻</div>
          <h1 className="text-2xl font-serif text-gray-900">Crea tu cuenta</h1>
          <p className="text-sm text-gray-500">Únete a nuestro jardín de flores</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">Nombre y Apellidos</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-5 h-5" />
              </span>
              <Input
                id="name"
                placeholder="Tu nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-10 h-11 rounded-xl border-2 bg-slate-50 focus:bg-white focus:border-fuchsia-400"
              />
            </div>
          </div>

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

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <Input
                id="password"
                type={showPass ? "text" : "password"}
                placeholder="Tu contraseña"
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
            <p className="text-xs text-gray-500">Mínimo 6 caracteres.</p>
          </div>

          {/* Confirmación */}
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-gray-700">Confirmar contraseña</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-5 h-5" />
              </span>
              <Input
                id="confirm"
                type={showPass2 ? "text" : "password"}
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="pl-10 pr-10 h-11 rounded-xl border-2 bg-slate-50 focus:bg-white focus:border-fuchsia-400"
              />
              <button
                type="button"
                onClick={() => setShowPass2((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPass2 ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPass2 ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl font-semibold text-white
                       bg-gradient-to-br from-rose-500 to-fuchsia-600
                       hover:from-rose-600 hover:to-fuchsia-700
                       transition-transform hover:-translate-y-[2px] shadow-lg"
          >
            {loading ? "Creando cuenta…" : "Crear cuenta 🌺"}
          </Button>
        </form>

        {/* Link a login */}
        <p className="text-center text-sm text-gray-500 mt-5">
          ¿Ya tienes cuenta?{" "}
          <a href={loginHref} className="text-fuchsia-600 font-semibold hover:underline">
            Inicia sesión
          </a>
        </p>
      </section>

      {/* Animaciones locales */}
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
