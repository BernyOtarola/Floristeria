import { Clock, MapPin } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";
import { FLORISTERIA_CONFIG } from "@shared/config";

export default function AboutSection() {
  return (
    <section id="nosotros" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Sobre {FLORISTERIA_CONFIG.name}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {FLORISTERIA_CONFIG.description} Ubicados en el corazón de {FLORISTERIA_CONFIG.location.city}, 
              nos especializamos en crear momentos únicos con flores frescas y arreglos personalizados 
              que reflejan la belleza natural de nuestra región.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <Clock className="text-primary mr-3 w-5 h-5 mt-1" />
                <div>
                  <p className="font-semibold">Horarios de Atención</p>
                  <p className="text-gray-600">{FLORISTERIA_CONFIG.hours.weekdays}</p>
                  <p className="text-gray-600">{FLORISTERIA_CONFIG.hours.weekends}</p>
                  <p className="text-gray-600">{FLORISTERIA_CONFIG.hours.sunday}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="text-primary mr-3 w-5 h-5 mt-1" />
                <div>
                  <p className="font-semibold">Ubicación</p>
                  <p className="text-gray-600">{FLORISTERIA_CONFIG.location.address}</p>
                  <p className="text-gray-600">{FLORISTERIA_CONFIG.location.city}, {FLORISTERIA_CONFIG.location.province}</p>
                  <a 
                    href={FLORISTERIA_CONFIG.location.googleMaps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 text-sm underline"
                  >
                    📍 Ver en Google Maps
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="text-primary mr-3 mt-1">📞</div>
                <div>
                  <p className="font-semibold">Contacto</p>
                  <p className="text-gray-600">WhatsApp: {FLORISTERIA_CONFIG.contact.whatsapp}</p>
                  <p className="text-gray-600">Email: {FLORISTERIA_CONFIG.contact.email}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <a 
                href={`https://wa.me/${FLORISTERIA_CONFIG.contact.whatsapp.replace('+', '')}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-colors"
              >
                <FaWhatsapp className="w-5 h-5" />
              </a>
              <a 
                href={FLORISTERIA_CONFIG.social.facebook}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a 
                href={FLORISTERIA_CONFIG.social.instagram}
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full transition-colors"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <img 
              src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
              alt="Florista trabajando en taller"
              className="rounded-xl shadow-lg"
            />
            <img 
              src="https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
              alt="Flores frescas de Bribri"
              className="rounded-xl shadow-lg mt-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
}