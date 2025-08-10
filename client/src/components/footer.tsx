import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";
import { FLORISTERIA_CONFIG } from "@shared/config";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">
              {FLORISTERIA_CONFIG.name}
            </h3>
            <p className="text-gray-400 mb-4">
              {FLORISTERIA_CONFIG.description}
            </p>
            <div className="flex space-x-3">
              <a 
                href={`https://wa.me/${FLORISTERIA_CONFIG.contact.whatsapp.replace('+', '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaWhatsapp className="w-5 h-5" />
              </a>
              <a 
                href={FLORISTERIA_CONFIG.social.facebook}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a 
                href={FLORISTERIA_CONFIG.social.instagram}
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
              <li>
                <span className="text-sm">
                  Envío gratis sobre {FLORISTERIA_CONFIG.currency.symbol}
                  {FLORISTERIA_CONFIG.services.delivery.freeThreshold.toLocaleString()}
                </span>
              </li>
              <li>
                <span className="text-sm">
                  Áreas de entrega: {FLORISTERIA_CONFIG.services.delivery.areas.join(", ")}
                </span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center">
                <span className="mr-2">📱</span>
                {FLORISTERIA_CONFIG.contact.whatsapp}
              </p>
              <p className="flex items-center">
                <span className="mr-2">✉️</span>
                {FLORISTERIA_CONFIG.contact.email}
              </p>
              <p className="flex items-start">
                <span className="mr-2 mt-1">📍</span>
                <span className="text-sm">
                  {FLORISTERIA_CONFIG.location.address}<br/>
                  {FLORISTERIA_CONFIG.location.city}, {FLORISTERIA_CONFIG.location.province}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 {FLORISTERIA_CONFIG.name}. Todos los derechos reservados.</p>
          <p className="text-sm mt-2">🌺 Flores frescas del corazón de {FLORISTERIA_CONFIG.location.city} 🌺</p>
        </div>
      </div>
    </footer>
  );
}