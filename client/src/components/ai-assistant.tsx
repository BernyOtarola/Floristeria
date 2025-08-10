import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const quickQuestions = [
    { key: "productos", label: "Ver productos" },
    { key: "horarios", label: "Horarios" },
    { key: "envios", label: "Envíos" },
    { key: "ubicacion", label: "Ubicación" },
    { key: "contacto", label: "Contacto" }
  ];

  const sendMessage = async (message: string, isQuickQuestion = false) => {
    if (!message.trim() && !isQuickQuestion) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          context: { isQuickQuestion }
        }),
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Lo siento, estoy experimentando dificultades técnicas en este momento. ¿Puedo ayudarte de otra manera?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleQuickQuestion = (questionKey: string) => {
    const quickResponses = {
      productos: "Tenemos 4 categorías principales: Rosas (12 productos), Ramos (18 productos), Arreglos (15 productos) y Ocasiones especiales (24 productos). ¿Hay alguna categoría específica que te interese?",
      horarios: "Nuestros horarios de atención son: Lunes a Sábado de 8:00 AM a 7:00 PM, y Domingos de 9:00 AM a 5:00 PM. ¿En qué más puedo ayudarte?",
      envios: "Ofrecemos dos opciones: Delivery por $8.000 o recogida gratuita en nuestra tienda ubicada en Calle 123 #45-67, Centro Comercial Plaza, Medellín. ¿Cuál prefieres?",
      ubicacion: "Estamos ubicados en Calle 123 #45-67, Centro Comercial Plaza, Medellín, Colombia. También puedes contactarnos al +57 300 123 4567.",
      contacto: "Puedes contactarnos por WhatsApp al +57 300 123 4567, por email a info@floravista.com, o visitarnos en Calle 123 #45-67, Centro Comercial Plaza, Medellín."
    };

    const questionTexts = {
      productos: "¿Qué productos tienen disponibles?",
      horarios: "¿Cuáles son sus horarios de atención?",
      envios: "¿Cómo funcionan los envíos?",
      ubicacion: "¿Dónde están ubicados?",
      contacto: "¿Cómo puedo contactarlos?"
    };

    const questionText = questionTexts[questionKey as keyof typeof questionTexts];
    const response = quickResponses[questionKey as keyof typeof quickResponses];

    // Add user question
    const userMessage: Message = {
      id: Date.now().toString(),
      text: questionText,
      isUser: true,
      timestamp: new Date(),
    };

    // Add assistant response
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      isUser: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white w-14 h-14 rounded-full shadow-lg transition-all transform hover:scale-110"
          size="icon"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Card className="w-80 h-96 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-primary text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold">Asistente FloraVista</h3>
                <p className="text-xs opacity-90">En línea</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${
                message.isUser 
                  ? "ml-auto bg-primary text-white" 
                  : "mr-auto bg-white"
              } p-3 rounded-lg shadow-sm max-w-[80%]`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          ))}
          
          {isLoading && (
            <div className="mr-auto bg-white p-3 rounded-lg shadow-sm">
              <p className="text-sm text-gray-500">Escribiendo...</p>
            </div>
          )}
          
          {/* Quick Questions (only show initially) */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <Button
                  key={question.key}
                  onClick={() => handleQuickQuestion(question.key)}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {question.label}
                </Button>
              ))}
            </div>
          )}
        </div>
        
        {/* Input */}
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 text-sm"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={isLoading || !inputMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}