import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, UserCog } from "lucide-react";
import { FLORISTERIA_CONFIG } from "@shared/config";
import AuthButtons from "@/components/auth-buttons";
import { useSession } from "@/hooks/use-session";

interface NavigationProps {
  cartItemCount: number;
  onToggleCart: () => void;
}

export default function Navigation({ cartItemCount, onToggleCart }: NavigationProps) {
  const { data } = useSession();
  const user = data?.user ?? null;
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-serif font-bold text-primary">
              {FLORISTERIA_CONFIG.name}
            </h1>
            <span className="ml-2 hidden sm:inline text-sm text-gray-600">
              {FLORISTERIA_CONFIG.slogan}
            </span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("inicio")}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection("catalogo")}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Catálogo
            </button>
            <button
              onClick={() => scrollToSection("nosotros")}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Nosotros
            </button>
            <button
              onClick={() => scrollToSection("contacto")}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Contacto
            </button>

            {/* Botón Admin: SOLO visible para admin */}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white bg-gradient-to-br from-rose-500 to-fuchsia-600 hover:from-rose-600 hover:to-fuchsia-700"
                title="Panel administrativo"
              >
                <UserCog className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Actions: Cart + Auth + Mobile menu */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleCart}
              className="relative p-2 text-gray-600 hover:text-primary transition-colors"
              aria-label="Abrir carrito"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Botones de autenticación (login/registro/cerrar sesión) */}
            <AuthButtons />

            {/* Mobile menu icon */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t py-3 space-y-1">
            <button
              onClick={() => scrollToSection("inicio")}
              className="block w-full text-left rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection("catalogo")}
              className="block w-full text-left rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              Catálogo
            </button>
            <button
              onClick={() => scrollToSection("nosotros")}
              className="block w-full text-left rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              Nosotros
            </button>
            <button
              onClick={() => scrollToSection("contacto")}
              className="block w-full text-left rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50"
            >
              Contacto
            </button>

            {/* Admin solo para rol admin */}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="mt-1 block rounded-md px-3 py-2 font-medium text-white bg-gradient-to-br from-rose-500 to-fuchsia-600"
                onClick={() => setMobileOpen(false)}
              >
                Panel Admin
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
