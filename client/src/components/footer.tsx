import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">FloraVista</h3>
            <p className="text-gray-400 mb-4">
              Tu floristería de confianza para momentos especiales. Flores frescas y arreglos únicos desde el corazón.
            </p>
            <div className="flex space-x-3">
              <a 
                href="https://wa.me/573001234567" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaWhatsapp className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com/floravista" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/floravista" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Productos</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Rosas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ramos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Arreglos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ocasiones Especiales</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Información</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Envíos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center">
                <span className="mr-2">📞</span>
                +57 300 123 4567
              </p>
              <p className="flex items-center">
                <span className="mr-2">✉️</span>
                info@floravista.com
              </p>
              <p className="flex items-center">
                <span className="mr-2">📍</span>
                Calle 123 #45-67, Medellín
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 FloraVista. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}