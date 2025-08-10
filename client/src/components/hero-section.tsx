import { Button } from "@/components/ui/button";
import { FLORISTERIA_CONFIG } from "@shared/config";

interface HeroSectionProps {
  onScrollToCatalog: () => void;
}

export default function HeroSection({ onScrollToCatalog }: HeroSectionProps) {
  return (
    <section id="inicio" className="relative h-96 md:h-[500px] flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      <div className="relative text-center text-white px-4 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-serif font-bold mb-4">
          {FLORISTERIA_CONFIG.slogan}
        </h2>
        <p className="text-xl md:text-2xl mb-2 font-light">
          {FLORISTERIA_CONFIG.description}
        </p>
        <p className="text-lg md:text-xl mb-8 font-light opacity-90">
          📍 {FLORISTERIA_CONFIG.location.address}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={onScrollToCatalog}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full text-lg font-medium transition-all transform hover:scale-105"
          >
            Ver Catálogo
          </Button>
          <a
            href={`https://wa.me/${FLORISTERIA_CONFIG.contact.whatsapp.replace('+', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <span>📱</span>
            WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}