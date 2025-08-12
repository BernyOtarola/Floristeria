import { ShoppingCart, Menu } from "lucide-react";
import { FLORISTERIA_CONFIG } from "@shared/config";
import AuthButtons from "@/components/auth-buttons";

interface NavigationProps {
  cartItemCount: number;
  onToggleCart: () => void;
}

export default function Navigation({ cartItemCount, onToggleCart }: NavigationProps) {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center">
            <h1 className="text-2xl font-serif font-bold text-primary">
              {FLORISTERIA_CONFIG.name}
            </h1>
            <span className="ml-2 text-sm text-gray-600">
              {FLORISTERIA_CONFIG.slogan}
            </span>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8">
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
          </div>

          {/* Actions: Cart + Auth */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleCart}
              className="relative p-2 text-gray-600 hover:text-primary transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Botones de autenticación */}
            <AuthButtons />

            {/* Mobile menu icon */}
            <button className="md:hidden p-2 text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
