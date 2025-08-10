import { Clock, MapPin } from "lucide-react";
import { FaWhatsapp, FaFacebook, FaInstagram } from "react-icons/fa";

export default function AboutSection() {
  return (
    <section id="nosotros" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6">
              Sobre FloraVista
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Con más de 15 años de experiencia, somos especialistas en crear momentos únicos con flores frescas y arreglos personalizados. Nuestra pasión es conectar emociones a través de la belleza natural.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Clock className="text-primary mr-3 w-5 h-5" />
                <div>
                  <p className="font-semibold">Horario de Atención</p>
                  <p className="text-gray-600">Lunes - Sábado: 8:00 AM - 7:00 PM</p>
                  <p className="text-gray-600">Domingo: 9:00 AM - 5:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="text-primary mr-3 w-5 h-5" />
                <div>
                  <p className="font-semibold">Ubicación</p>
                  <p className="text-gray-600">Calle 123 #45-67, Centro Comercial Plaza</p>
                  <p className="text-gray-600">Medellín, Colombia</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <a 
                href="https://wa.me/573001234567" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-colors"
              >
                <FaWhatsapp className="w-5 h-5" />
              </a>
              <a 
                href="https://facebook.com/floravista" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/floravista" 
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
              alt="Flores frescas siendo preparadas"
              className="rounded-xl shadow-lg mt-8"
            />
          </div>
        </div>
      </div>
    </section>
  );
}